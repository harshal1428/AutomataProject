import { useState, useCallback, useEffect, useMemo } from 'react';
import type { TuringMachine, StateId, TraceEntry } from '../core/types';
import { computeTMStep } from '../core/engine-tm';

export type AutomatonStatus = 'idle' | 'running' | 'accepted' | 'rejected';

export function useTuringMachine(tm: TuringMachine | null) {
  const [input, setInput] = useState('');
  const [tape, setTape] = useState<string[]>([]);
  const [head, setHead] = useState(0);
  const [stateId, setStateId] = useState<StateId>('');
  const [status, setStatus] = useState<AutomatonStatus>('idle');
  const [trace, setTrace] = useState<TraceEntry[]>([]);

  const currentStates = useMemo(
    () => (stateId ? new Set([stateId]) : new Set<StateId>()),
    [stateId]
  );

  const getInitialId = (t: TuringMachine): StateId => {
    for (const sid in t.states) {
      if (t.states[sid].isInitial) return sid;
    }
    return '';
  };

  useEffect(() => {
    if (!tm) return;
    setTape(input.split(''));
    setHead(0);
    setStateId(getInitialId(tm));
    setStatus('idle');
    setTrace([]);
  }, [tm, input]);

  const reset = useCallback(
    (newInput?: string) => {
      if (newInput !== undefined) setInput(newInput);
      setStatus('idle');
      setTrace([]);
      if (tm) {
        const inp = newInput !== undefined ? newInput : input;
        setTape(inp.split(''));
        setHead(0);
        setStateId(getInitialId(tm));
      }
    },
    [tm, input]
  );

  const step = useCallback(() => {
    if (!tm || status === 'accepted' || status === 'rejected') return;
    if (status === 'idle') setStatus('running');

    const next = computeTMStep(tm, stateId, tape, head);

    if (next) {
      const readSym = tape[head] ?? tm.blankSymbol;
      setTrace((prev) => [
        ...prev,
        {
          step: prev.length + 1,
          state: stateId,
          symbol: readSym,
          description: `δ(${stateId}, '${readSym}') = (${next.stateId}, '${next.tape[head] ?? '□'}', ${
            head < next.head ? 'R' : head > next.head ? 'L' : 'S'
          })`,
        },
      ]);
      setTape(next.tape);
      setHead(next.head);
      setStateId(next.stateId);
      if (tm.states[next.stateId].isFinal) setStatus('accepted');
    } else {
      if (tm.states[stateId].isFinal) {
        setStatus('accepted');
      } else {
        setStatus('rejected');
      }
      setTrace((prev) => [
        ...prev,
        {
          step: prev.length + 1,
          state: stateId,
          symbol: tape[head] ?? '□',
          description: tm.states[stateId].isFinal ? '✓ Accepted (halt state)' : '✗ Rejected (no transition)',
        },
      ]);
    }
  }, [tm, stateId, tape, head, status]);

  return {
    input,
    tape,
    head,
    stateId,
    currentStates,
    status,
    trace,
    step,
    reset,
    setInput,
  };
}
