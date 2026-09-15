import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { AdapterContext, RegistryRecord, Principal } from '@ual/adapter-contract';
import { AdapterError } from '@ual/adapter-contract';
import { AssertionMinter } from '@ual/assertions';
import { RestJsonV1Adapter, type RowIssueRecorder } from '../src/index.js';

beforeAll(() => {
  process.env['UAL_ASSERTION_KEY_SEED'] = 'test-seed-rest-json-v1';
});

type Handler = (req: IncomingMessage, res: ServerResponse, body: string) => void;

let server: Server | undefined;

/** Spin an ephemeral stub spoke; returns its base URL. */
async function stub(handler: Handler): Promise<string> {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => handler(req, res, body));
  });
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  const { port } = server!.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
});

const principal: Principal = {
  principalId: '01JD-PRINCIPAL', displayName: 'Marcus Vale', identityMethod: 'CAC_PIV',
  roles: ['INVESTIGATOR'], activeRole: 'INVESTIGATOR',
  attributes: { organization: 'DCSA', clearanceTier: 'T5', assignedRegion: 'NE', caseAssignments: [], subjectRef: null },
  sessionId: 'S', issuedAt: '2026-09-14T15:00:00Z', expiresAt: '2026-09-14T15:30:00Z',
};

function ctx(overrides: Partial<AdapterContext> = {}): AdapterContext {
  return {
    principal,
    scope: { mode: 'SUBJECT', subjectRef: 'SUB-1' },
    correlationId: 'CORR-1',
    requestId: 'REQ-1',
    deadlineAt: new Date(Date.now() + 5000).toISOString(),
    ...overrides,
  };
}

function policy(baseEndpoint: string): RegistryRecord {
  return {
    applicationId: 'TESTAPP', displayName: 'Test Application', iconToken: 'icon-x',
    adapterType: 'REST_JSON_V1', baseEndpoint, healthEndpoint: `${baseEndpoint}/health`,
    contractVersion: '1.0',
    workItemTypes: [{
      type: 'WORK_ITEM', label: 'Work item', contentProfile: 'ITEM_DETAIL', priorityNative: true,
      statusMap: { OPEN: 'OPEN', IN_REVIEW: 'IN_PROGRESS', RESOLVED: 'CLOSED' },
      // registry-driven path segment (no per-spoke switch anywhere in src)
      pathSegment: 'items',
    } as RegistryRecord['workItemTypes'][number]],
    supportedActions: [{
      actionId: 'RESOLVE', label: 'Resolve', appliesToTypes: ['WORK_ITEM'],
      requiredPermission: 'WORK_ITEM.ACT', formSchema: null, targetSystems: ['TESTAPP'], idempotent: true,
    }],
    capabilities: {
      supportsSearch: true, supportsFilter: ['status'], supportsContext: false,
      supportsSummary: true, supportsActivityHistory: true, maxPageSize: 200,
    },
    relationshipTypesEmitted: [], visibleToRoles: ['INVESTIGATOR'],
    timeoutMs: 5000, actionTimeoutMs: 10000, healthTimeoutMs: 2000,
    maxRetries: 2, backoffInitialMs: 200, backoffMultiplier: 2, backoffJitterPct: 20,
    circuitFailureThreshold: 5, circuitOpenMs: 30000, circuitHalfOpenProbes: 1,
    healthProbeIntervalSec: 30, degradedLatencyMs: 1500,
    enabled: true, configState: 'VALID', isDemoSixthApp: false,
  };
}

function row(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    nativeId: 'W-1', subjectRef: 'SUB-1', subjectDisplayName: 'Subject One',
    type: 'WORK_ITEM', title: 'A work item', status: 'OPEN', priority: 'HIGH',
    assignedPrincipalId: '01JD-ASSIGNEE', assignedDisplayName: 'Assignee',
    createdAt: '2026-09-14T10:00:00Z', dueDate: null, lastActivityAt: '2026-09-14T11:00:00Z',
    stateVersion: 'v1',
    ...overrides,
  };
}

class RecordingRows implements RowIssueRecorder {
  readonly recorded: AdapterError[] = [];
  record(err: AdapterError): void { this.recorded.push(err); }
}

const minter = new AssertionMinter();

describe('RestJsonV1Adapter', () => {
  it('a read sends the required X-UAL headers and the scope round-trips', async () => {
    const seen: Record<string, string | undefined> = {};
    const base = await stub((req, res) => {
      seen['principal'] = req.headers['x-ual-principal'] as string | undefined;
      seen['scope'] = req.headers['x-ual-scope'] as string | undefined;
      seen['correlation'] = req.headers['x-ual-correlation-id'] as string | undefined;
      seen['request'] = req.headers['x-ual-request-id'] as string | undefined;
      seen['deadline'] = req.headers['x-ual-deadline'] as string | undefined;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(row()));
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    await adapter.getWorkItem(ctx(), 'W-1');

    expect(seen['principal']).toBeTruthy();
    expect(seen['correlation']).toBe('CORR-1');
    expect(seen['request']).toBe('REQ-1');
    expect(seen['deadline']).toBeTruthy();
    expect(JSON.parse(seen['scope']!)).toEqual({ mode: 'SUBJECT', subjectRef: 'SUB-1' });
  });

  it('a mutation sends X-UAL-Idempotency-Key', async () => {
    let idemKey: string | undefined;
    const base = await stub((req, res) => {
      idemKey = req.headers['x-ual-idempotency-key'] as string | undefined;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ item: row({ status: 'RESOLVED' }), stateVersion: 'v2', appliedAt: '2026-09-14T12:00:00Z' }));
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    await adapter.performAction(ctx({ idempotencyKey: '01JD-IDEM' }), 'W-1', 'RESOLVE', { disposition: 'X' });
    expect(idemKey).toBe('01JD-IDEM');
  });

  it('a 422 business rejection RESOLVES with the exact plainMessage and does NOT throw', async () => {
    let call = 0;
    const base = await stub((req, res) => {
      call++;
      if (call === 1) {
        // the action POST → 422
        res.writeHead(422, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ code: 'ACTION_REJECTED', message: 'This issue has already been resolved.' }));
      } else {
        // the re-read GET
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(row({ status: 'RESOLVED' })));
      }
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    const result = await adapter.performAction(ctx({ idempotencyKey: 'K' }), 'W-1', 'RESOLVE', {});
    expect(result.outcome).toBe('REJECTED');
    expect(result.rejectionReason?.plainMessage).toBe('This issue has already been resolved.');
  });

  it('a 503 THROWS an AdapterError of class ADAPTER_UNREACHABLE', async () => {
    const base = await stub((req, res) => {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ code: 'SERVICE_UNAVAILABLE', message: 'down' }));
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    await expect(adapter.getWorkItem(ctx(), 'W-1')).rejects.toMatchObject({
      detail: { class: 'ADAPTER_UNREACHABLE' },
    });
  });

  it('a list with one malformed row and two good rows returns 2 items and records 1 issue', async () => {
    const base = await stub((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        items: [
          row({ nativeId: 'W-1' }),
          row({ nativeId: 'W-2', status: 'NOT_A_MAPPED_STATUS' }),  // malformed: unmapped status
          row({ nativeId: 'W-3' }),
        ],
        nextCursor: null, totalKnown: 3, truncated: false,
      }));
    });
    const rows = new RecordingRows();
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter, rows);
    const result = await adapter.listWorkItems(ctx(), {}, { limit: 10 });
    expect(result.items).toHaveLength(2);
    expect(rows.recorded).toHaveLength(1);
    expect(rows.recorded[0]!.detail.class).toBe('ADAPTER_CONTRACT_ERROR');
  });

  it('an unmapped native status on a get yields ADAPTER_CONTRACT_ERROR, not a default', async () => {
    const base = await stub((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(row({ status: 'MYSTERY_STATUS' })));
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    await expect(adapter.getWorkItem(ctx(), 'W-1')).rejects.toMatchObject({
      detail: { class: 'ADAPTER_CONTRACT_ERROR' },
    });
  });

  it('a 100ms deadline against a slow stub aborts within 150ms', async () => {
    const base = await stub((req, res) => {
      // never respond within the budget
      setTimeout(() => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(row()));
      }, 1000);
    });
    const adapter = new RestJsonV1Adapter('TESTAPP', policy(base), minter);
    const started = Date.now();
    await expect(
      adapter.getWorkItem(ctx({ deadlineAt: new Date(Date.now() + 100).toISOString() }), 'W-1'),
    ).rejects.toBeTruthy();
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(150);
  });
});
