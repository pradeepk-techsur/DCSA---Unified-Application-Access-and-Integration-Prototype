import { describe, it, expect } from 'vitest';
import {
  AdapterError,
  type SpokeAdapter,
  type AdapterContext,
  type RegistryRecord,
  type Principal,
  type WorkItem,
  type GetResult,
  type ListResult,
  type ActionResult,
} from '@ual/adapter-contract';
import { invoke } from '../src/invoke.js';
import { Circuit } from '../src/circuit.js';
import { type IssueSink } from '../src/issues.js';

const principal: Principal = {
  principalId: '01JD-PRINCIPAL',
  displayName: 'Marcus Vale',
  identityMethod: 'CAC_PIV',
  roles: ['INVESTIGATOR'],
  activeRole: 'INVESTIGATOR',
  attributes: {
    organization: 'DCSA', clearanceTier: 'T5', assignedRegion: 'NE',
    caseAssignments: [], subjectRef: null,
  },
  sessionId: 'S', issuedAt: '2026-09-14T15:00:00Z', expiresAt: '2026-09-14T15:30:00Z',
};

function ctx(overrides: Partial<AdapterContext> = {}): AdapterContext {
  return {
    principal,
    scope: { mode: 'ORG', organization: 'DCSA' },
    correlationId: 'CORR',
    requestId: 'REQ',
    deadlineAt: new Date(Date.now() + 10_000).toISOString(),
    ...overrides,
  };
}

function policy(overrides: Partial<RegistryRecord> = {}): RegistryRecord {
  return {
    applicationId: 'EAPP', displayName: 'eApp', iconToken: 'icon-x',
    adapterType: 'REST_JSON_V1', baseEndpoint: 'http://x', healthEndpoint: 'http://x/health',
    contractVersion: '1.0', workItemTypes: [], supportedActions: [],
    capabilities: {
      supportsSearch: true, supportsFilter: [], supportsContext: false,
      supportsSummary: false, supportsActivityHistory: false, maxPageSize: 200,
    },
    relationshipTypesEmitted: [], visibleToRoles: ['INVESTIGATOR'],
    timeoutMs: 5000, actionTimeoutMs: 10000, healthTimeoutMs: 2000,
    maxRetries: 2, backoffInitialMs: 5, backoffMultiplier: 2, backoffJitterPct: 0,
    circuitFailureThreshold: 5, circuitOpenMs: 30000, circuitHalfOpenProbes: 1,
    healthProbeIntervalSec: 30, degradedLatencyMs: 1500,
    enabled: true, configState: 'VALID', isDemoSixthApp: false,
    ...overrides,
  };
}

function workItem(): WorkItem {
  return {
    workItemId: 'EAPP:1', nativeId: '1', sourceSystem: 'EAPP', sourceSystemLabel: 'eApp',
    subjectRef: 'SUB', subjectDisplayName: 'Subj', type: 'T', typeLabel: 'T',
    title: 'x', status: 'OPEN', statusLabel: 'Open', statusCategory: 'OPEN',
    priority: 'ROUTINE', priorityProvided: false, assigneeId: null, assigneeDisplayName: null,
    assigneeResolvable: false, createdAt: 'now', dueDate: null, lastActivityAt: 'now',
    overdue: false, relatedRefs: [], sourceHealth: 'HEALTHY',
  };
}

class RecordingSink implements IssueSink {
  readonly recorded: AdapterError[] = [];
  async record(err: AdapterError): Promise<void> { this.recorded.push(err); }
}

/** A configurable fake adapter. Each operation is backed by a supplied fn. */
function fakeAdapter(impl: Partial<SpokeAdapter>): SpokeAdapter {
  return {
    applicationId: 'EAPP',
    adapterType: 'REST_JSON_V1',
    describe: impl.describe ?? (async () => { throw new Error('nope'); }),
    healthCheck: impl.healthCheck ?? (async () => ({ status: 'HEALTHY', latencyMs: 1, checkedAt: 'now', version: '1' })),
    listWorkItems: impl.listWorkItems ?? (async () => ({ items: [], nextCursor: null, totalKnown: null, truncated: false })),
    getWorkItem: impl.getWorkItem ?? (async () => { throw new Error('nope'); }),
    performAction: impl.performAction ?? (async () => { throw new Error('nope'); }),
  };
}

const deps = (circuit: Circuit, issues: IssueSink, p = policy()) => ({
  policy: p, circuit, issues, sleep: async () => {},
});

describe('invoke()', () => {
  it('a retryable read is retried up to maxRetries', async () => {
    let calls = 0;
    const adapter = fakeAdapter({
      async getWorkItem(): Promise<GetResult> {
        calls++;
        if (calls < 3) {
          const e = new Error('refused') as Error & { code: string };
          e.code = 'ECONNREFUSED';
          throw e;
        }
        return { item: workItem(), typeSpecificDetail: {}, availableActions: [], relatedRefs: [], stateVersion: 'v1', activitySupported: true };
      },
    });
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    const res = await invoke(adapter, 'getWorkItem', ['1'], ctx(), deps(circuit, sink));
    expect(res.item.workItemId).toBe('EAPP:1');
    expect(calls).toBe(3);                    // 1 initial + 2 retries
  });

  it('a retryable read that never recovers throws after maxRetries attempts', async () => {
    let calls = 0;
    const adapter = fakeAdapter({
      async getWorkItem(): Promise<GetResult> {
        calls++;
        const e = new Error('refused') as Error & { code: string };
        e.code = 'ECONNREFUSED';
        throw e;
      },
    });
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    await expect(invoke(adapter, 'getWorkItem', ['1'], ctx(), deps(circuit, sink)))
      .rejects.toMatchObject({ detail: { class: 'ADAPTER_UNREACHABLE' } });
    expect(calls).toBe(3);                    // maxRetries 2 + 1
  });

  it('a performAction timeout is attempted exactly once and yields ADAPTER_INDETERMINATE', async () => {
    let calls = 0;
    const adapter = fakeAdapter({
      async performAction(): Promise<ActionResult> {
        calls++;
        const e = new Error('aborted') as Error & { name: string };
        e.name = 'AbortError';
        throw e;
      },
    });
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    await expect(
      invoke(adapter, 'performAction', ['1', 'RESOLVE_ISSUE', {}], ctx(), deps(circuit, sink)),
    ).rejects.toMatchObject({ detail: { class: 'ADAPTER_INDETERMINATE', retryable: false } });
    expect(calls).toBe(1);                    // never auto-retried
  });

  it('a retry that would not complete before deadlineAt is not attempted', async () => {
    let calls = 0;
    const adapter = fakeAdapter({
      async getWorkItem(): Promise<GetResult> {
        calls++;
        const e = new Error('refused') as Error & { code: string };
        e.code = 'ECONNREFUSED';
        throw e;
      },
    });
    // Deadline only 2ms out; backoffInitialMs is 5 → the retry cannot fit.
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    await expect(
      invoke(adapter, 'getWorkItem', ['1'], ctx({ deadlineAt: new Date(Date.now() + 2).toISOString() }), deps(circuit, sink)),
    ).rejects.toBeInstanceOf(AdapterError);
    expect(calls).toBe(1);                    // no retry: it would land past the deadline
  });

  it('ADAPTER_NOT_FOUND and ADAPTER_REJECTED record NO issue; ADAPTER_UNREACHABLE records one', async () => {
    const circuit = new Circuit('EAPP', policy());
    const notFoundSink = new RecordingSink();
    const nf = fakeAdapter({
      async getWorkItem(): Promise<GetResult> {
        throw new AdapterError({ class: 'ADAPTER_NOT_FOUND', applicationId: 'EAPP', operation: 'getWorkItem', correlationId: 'CORR', requestId: 'REQ', retryable: false });
      },
    });
    await expect(invoke(nf, 'getWorkItem', ['1'], ctx(), deps(circuit, notFoundSink))).rejects.toBeInstanceOf(AdapterError);
    expect(notFoundSink.recorded).toHaveLength(0);

    const rejSink = new RecordingSink();
    const rej = fakeAdapter({
      async performAction(): Promise<ActionResult> {
        throw new AdapterError({ class: 'ADAPTER_REJECTED', applicationId: 'EAPP', operation: 'performAction', correlationId: 'CORR', requestId: 'REQ', retryable: false });
      },
    });
    await expect(invoke(rej, 'performAction', ['1', 'A', {}], ctx(), deps(new Circuit('EAPP', policy()), rejSink))).rejects.toBeInstanceOf(AdapterError);
    expect(rejSink.recorded).toHaveLength(0);

    const unreachSink = new RecordingSink();
    const unreach = fakeAdapter({
      async getWorkItem(): Promise<GetResult> {
        const e = new Error('down') as Error & { code: string };
        e.code = 'ECONNREFUSED';
        throw e;
      },
    });
    const noRetryPolicy = policy({ maxRetries: 0 });
    await expect(invoke(unreach, 'getWorkItem', ['1'], ctx(), deps(new Circuit('EAPP', noRetryPolicy), unreachSink, noRetryPolicy))).rejects.toBeInstanceOf(AdapterError);
    expect(unreachSink.recorded).toHaveLength(1);
  });

  it('a schema-invalid response becomes ADAPTER_CONTRACT_ERROR', async () => {
    const adapter = fakeAdapter({
      // items is missing entirely → contract error
      async listWorkItems(): Promise<ListResult> {
        return { nextCursor: null, totalKnown: null, truncated: false } as unknown as ListResult;
      },
    });
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    await expect(invoke(adapter, 'listWorkItems', [{}, { limit: 10 }], ctx(), deps(circuit, sink)))
      .rejects.toMatchObject({ detail: { class: 'ADAPTER_CONTRACT_ERROR' } });
  });

  it('an open circuit fails fast with ADAPTER_CIRCUIT_OPEN without touching the adapter', async () => {
    let touched = false;
    const adapter = fakeAdapter({
      async getWorkItem(): Promise<GetResult> { touched = true; throw new Error('should not run'); },
    });
    const circuit = new Circuit('EAPP', policy());
    for (let i = 0; i < 5; i++) circuit.recordFailure();   // force OPEN
    const sink = new RecordingSink();
    await expect(invoke(adapter, 'getWorkItem', ['1'], ctx(), deps(circuit, sink)))
      .rejects.toMatchObject({ detail: { class: 'ADAPTER_CIRCUIT_OPEN' } });
    expect(touched).toBe(false);
  });

  it('healthCheck is admitted while the circuit is OPEN', async () => {
    let touched = false;
    const adapter = fakeAdapter({
      async healthCheck() { touched = true; return { status: 'HEALTHY' as const, latencyMs: 1, checkedAt: 'now', version: '1' }; },
    });
    const circuit = new Circuit('EAPP', policy());
    for (let i = 0; i < 5; i++) circuit.recordFailure();   // force OPEN
    expect(circuit.state()).toBe('OPEN');
    const sink = new RecordingSink();
    const res = await invoke(adapter, 'healthCheck', [], ctx(), deps(circuit, sink));
    expect(res.status).toBe('HEALTHY');
    expect(touched).toBe(true);                             // the bypass let it through
  });

  it('a successful read records success and returns the typed result', async () => {
    const adapter = fakeAdapter({
      async listWorkItems(): Promise<ListResult> {
        return { items: [workItem()], nextCursor: null, totalKnown: 1, truncated: false };
      },
    });
    const circuit = new Circuit('EAPP', policy());
    const sink = new RecordingSink();
    const res = await invoke(adapter, 'listWorkItems', [{}, { limit: 10 }], ctx(), deps(circuit, sink));
    expect(res.items).toHaveLength(1);
    expect(sink.recorded).toHaveLength(0);
  });
});
