import { describe, it, expect } from 'vitest';
import { Circuit, type CircuitPolicy } from '../src/circuit.js';

const policy: CircuitPolicy = {
  circuitFailureThreshold: 5,
  circuitOpenMs: 30_000,
  circuitHalfOpenProbes: 1,
};

/** A controllable clock so we can advance time without waiting. */
function fakeClock(start = 0): { now: () => number; advance: (ms: number) => void } {
  let t = start;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

describe('Circuit', () => {
  it('opens after circuitFailureThreshold consecutive failures', () => {
    const c = new Circuit('EAPP', policy);
    expect(c.state()).toBe('CLOSED');
    for (let i = 0; i < 4; i++) c.recordFailure();
    expect(c.state()).toBe('CLOSED');       // 4 failures — still closed
    c.recordFailure();                       // 5th failure
    expect(c.state()).toBe('OPEN');
  });

  it('a success resets the consecutive-failure count while CLOSED', () => {
    const c = new Circuit('EAPP', policy);
    for (let i = 0; i < 4; i++) c.recordFailure();
    c.recordSuccess();
    for (let i = 0; i < 4; i++) c.recordFailure();
    expect(c.state()).toBe('CLOSED');       // count was reset, so 4 < 5
  });

  it('an OPEN circuit refuses non-exempt calls (isOpen === true)', () => {
    const c = new Circuit('EAPP', policy);
    for (let i = 0; i < 5; i++) c.recordFailure();
    expect(c.state()).toBe('OPEN');
    expect(c.isOpen()).toBe(true);
  });

  it('after circuitOpenMs the state becomes HALF_OPEN', () => {
    const clock = fakeClock();
    const c = new Circuit('EAPP', policy, undefined, clock.now);
    for (let i = 0; i < 5; i++) c.recordFailure();
    expect(c.state()).toBe('OPEN');
    clock.advance(29_999);
    expect(c.state()).toBe('OPEN');         // not yet
    clock.advance(2);                        // now past circuitOpenMs
    expect(c.state()).toBe('HALF_OPEN');
  });

  it('one successful probe closes a HALF_OPEN circuit', () => {
    const clock = fakeClock();
    const c = new Circuit('EAPP', policy, undefined, clock.now);
    for (let i = 0; i < 5; i++) c.recordFailure();
    clock.advance(30_001);
    expect(c.state()).toBe('HALF_OPEN');
    c.onDispatch();                          // a probe goes out
    c.recordSuccess();
    expect(c.state()).toBe('CLOSED');
  });

  it('a failed probe re-opens the circuit and resets the timer', () => {
    const clock = fakeClock();
    const c = new Circuit('EAPP', policy, undefined, clock.now);
    for (let i = 0; i < 5; i++) c.recordFailure();
    clock.advance(30_001);
    expect(c.state()).toBe('HALF_OPEN');
    c.onDispatch();
    c.recordFailure();                       // probe fails
    expect(c.state()).toBe('OPEN');
    // Timer reset: another full circuitOpenMs must elapse before HALF_OPEN again.
    clock.advance(29_999);
    expect(c.state()).toBe('OPEN');
    clock.advance(2);
    expect(c.state()).toBe('HALF_OPEN');
  });

  it('HALF_OPEN admits only circuitHalfOpenProbes calls', () => {
    const clock = fakeClock();
    const c = new Circuit('EAPP', policy, undefined, clock.now);
    for (let i = 0; i < 5; i++) c.recordFailure();
    clock.advance(30_001);
    expect(c.state()).toBe('HALF_OPEN');
    expect(c.isOpen()).toBe(false);          // first probe admitted
    c.onDispatch();
    expect(c.isOpen()).toBe(true);           // second probe refused (threshold 1)
  });

  it('emits a transition record on open', () => {
    const transitions: string[] = [];
    const c = new Circuit('EAPP', policy, undefined, Date.now, (t) => {
      transitions.push(`${t.from}->${t.to}`);
    });
    for (let i = 0; i < 5; i++) c.recordFailure();
    expect(transitions).toContain('CLOSED->OPEN');
  });
});
