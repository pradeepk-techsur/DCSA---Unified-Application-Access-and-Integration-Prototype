// packages/adapter-runtime/src/circuit.ts
//
// The per-application failure gate: a CLOSED / OPEN / HALF_OPEN state machine,
// hand-written (ADR-007 explains why not `opossum`). One instance per
// applicationId. Bounds come from the registry row, never from constants here.
//
//   CLOSED --consecutiveFailures >= circuitFailureThreshold--> OPEN
//   OPEN   --after circuitOpenMs--> HALF_OPEN
//   HALF_OPEN admits circuitHalfOpenProbes calls;
//     success -> CLOSED; failure -> OPEN with the timer reset.
//
// healthCheck() BYPASSES this machine entirely in every state, so recovery is
// always detectable (FR-F08a-05 rule 5).

import type { RegistryRecord } from '@ual/adapter-contract';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type CircuitPolicy = Pick<
  RegistryRecord,
  'circuitFailureThreshold' | 'circuitOpenMs' | 'circuitHalfOpenProbes'
>;

export interface CircuitSnapshot {
  applicationId: string;
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number | null;
  halfOpenProbesInFlight: number;
}

/**
 * The persistence port. Every transition is designed to persist to
 * hub.application_health; plan 01-06 ships the pg-backed implementation. This
 * package ships the in-memory one below.
 */
export interface CircuitStateStore {
  load(applicationId: string): CircuitSnapshot | undefined;
  save(snapshot: CircuitSnapshot): void;
}

export class InMemoryCircuitStateStore implements CircuitStateStore {
  private readonly map = new Map<string, CircuitSnapshot>();
  load(applicationId: string): CircuitSnapshot | undefined {
    return this.map.get(applicationId);
  }
  save(snapshot: CircuitSnapshot): void {
    this.map.set(snapshot.applicationId, { ...snapshot });
  }
}

/** A monotonic-ish clock, injectable so tests can advance time deterministically. */
export type Clock = () => number;

/** Emitted on every transition; designed to become an integration_issues row. */
export interface CircuitTransition {
  applicationId: string;
  from: CircuitState;
  to: CircuitState;
  at: number;
  reason: string;
}

export type TransitionListener = (t: CircuitTransition) => void;

export class Circuit {
  private snapshot: CircuitSnapshot;

  constructor(
    readonly applicationId: string,
    private readonly policy: CircuitPolicy,
    private readonly store: CircuitStateStore = new InMemoryCircuitStateStore(),
    private readonly now: Clock = Date.now,
    private readonly onTransition: TransitionListener = () => {},
  ) {
    this.snapshot =
      store.load(applicationId) ?? {
        applicationId,
        state: 'CLOSED',
        consecutiveFailures: 0,
        openedAt: null,
        halfOpenProbesInFlight: 0,
      };
  }

  state(): CircuitState {
    this.maybePromoteToHalfOpen();
    return this.snapshot.state;
  }

  snapshotOf(): CircuitSnapshot {
    return { ...this.snapshot };
  }

  /** Whether a NON-exempt call should be refused right now. */
  isOpen(): boolean {
    this.maybePromoteToHalfOpen();
    if (this.snapshot.state === 'OPEN') return true;
    if (this.snapshot.state === 'HALF_OPEN') {
      // Admit only up to circuitHalfOpenProbes probes; refuse the rest.
      return this.snapshot.halfOpenProbesInFlight >= this.policy.circuitHalfOpenProbes;
    }
    return false;
  }

  /** Call immediately before dispatching a non-exempt call that isOpen() allowed. */
  onDispatch(): void {
    if (this.snapshot.state === 'HALF_OPEN') {
      this.snapshot.halfOpenProbesInFlight += 1;
      this.persist();
    }
  }

  recordSuccess(): void {
    const from = this.snapshot.state;
    if (from === 'HALF_OPEN') {
      // A successful probe closes the circuit.
      this.transition('CLOSED', 'half-open probe succeeded');
      this.snapshot.consecutiveFailures = 0;
      this.snapshot.openedAt = null;
      this.snapshot.halfOpenProbesInFlight = 0;
    } else {
      this.snapshot.consecutiveFailures = 0;
    }
    this.persist();
  }

  recordFailure(): void {
    const from = this.snapshot.state;
    if (from === 'HALF_OPEN') {
      // A failed probe re-opens with the timer reset.
      this.snapshot.consecutiveFailures += 1;
      this.snapshot.halfOpenProbesInFlight = 0;
      this.open('half-open probe failed');
      return;
    }
    this.snapshot.consecutiveFailures += 1;
    if (
      from === 'CLOSED' &&
      this.snapshot.consecutiveFailures >= this.policy.circuitFailureThreshold
    ) {
      this.open('failure threshold reached');
      return;
    }
    this.persist();
  }

  private open(reason: string): void {
    this.snapshot.openedAt = this.now();
    this.transition('OPEN', reason);
    this.persist();
  }

  private maybePromoteToHalfOpen(): void {
    if (
      this.snapshot.state === 'OPEN' &&
      this.snapshot.openedAt !== null &&
      this.now() - this.snapshot.openedAt >= this.policy.circuitOpenMs
    ) {
      this.snapshot.halfOpenProbesInFlight = 0;
      this.transition('HALF_OPEN', 'open duration elapsed');
      this.persist();
    }
  }

  private transition(to: CircuitState, reason: string): void {
    const from = this.snapshot.state;
    if (from === to) return;
    this.snapshot.state = to;
    this.onTransition({ applicationId: this.applicationId, from, to, at: this.now(), reason });
  }

  private persist(): void {
    this.store.save(this.snapshot);
  }
}
