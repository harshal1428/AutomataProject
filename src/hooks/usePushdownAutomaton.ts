import { useState, useCallback, useEffect, useMemo } from 'react';
import type { PDA, PDAConfiguration, TraceEntry } from '../core/types';
import { computePDANextConfigs, isPDAAccepted } from '../core/engine-pda';

export type AutomatonStatus = 'idle' | 'running' | 'accepted' | 'rejected';

export function usePushdownAutomaton(pda: PDA | null) {
  const [input, setInput] = useState('');
  const [pointer, setPointer] = useState(0);
  const [activeConfigs, setActiveConfigs] = useState<PDAConfiguration[]>([]);
  const [status, setStatus] = useState<AutomatonStatus>('idle');
  const [trace, setTrace] = useState<TraceEntry[]>([]);

  const currentStates = useMemo(
    () => new Set(activeConfigs.map((c) => c.stateId)),
    [activeConfigs]
  );

  const getInitialConfigs = (p: PDA): PDAConfiguration[] => {
    const initial: PDAConfiguration[] = [];
    for (const sid in p.states) {
      if (p.states[sid].isInitial) initial.push({ stateId: sid, stack: [] });
    }
    const eps = computePDANextConfigs(p, initial, '');
    return eps.length > 0 ? eps : initial;
  };

  useEffect(() => {
    if (!pda) return;
    setActiveConfigs(getInitialConfigs(pda));
    setPointer(0);
    setStatus('idle');
    setTrace([]);
  }, [pda]);

  const reset = useCallback(
    (newInput?: string) => {
      if (newInput !== undefined) setInput(newInput);
      setPointer(0);
      setStatus('idle');
      setTrace([]);
      if (pda) setActiveConfigs(getInitialConfigs(pda));
      else setActiveConfigs([]);
    },
    [pda]
  );

  const step = useCallback(() => {
    if (!pda || status === 'accepted' || status === 'rejected') return;

    if (status === 'idle') setStatus('running');

    if (pointer >= input.length) {
      const accepted = isPDAAccepted(pda, activeConfigs);
      const newStatus = accepted ? 'accepted' : 'rejected';
      setStatus(newStatus);
      setTrace((prev) => [
        ...prev,
        {
          step: prev.length + 1,
          state: activeConfigs.map((c) => c.stateId).join(', ') || '∅',
          symbol: 'EOF',
          description: newStatus === 'accepted' ? '✓ Accepted (empty stack)' : '✗ Rejected',
        },
      ]);
      return;
    }

    const symbol = input[pointer];
    const fromLabel = activeConfigs.map((c) => `${c.stateId}[${c.stack.join('')}]`).join(' | ') || '∅';
    const nextConfigs = computePDANextConfigs(pda, activeConfigs, symbol);
    const toLabel = nextConfigs.map((c) => `${c.stateId}[${c.stack.join('')}]`).join(' | ') || '∅ (dead)';

    setTrace((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        state: fromLabel,
        symbol: `'${symbol}'`,
        description: `${fromLabel} →[${symbol}]→ ${toLabel}`,
      },
    ]);

    setActiveConfigs(nextConfigs);
    setPointer((prev) => prev + 1);

    if (nextConfigs.length === 0) setStatus('rejected');
  }, [pda, input, pointer, activeConfigs, status]);

  return {
    input,
    pointer,
    activeConfigs,
    currentStates,
    status,
    trace,
    step,
    reset,
    setInput,
  };
}
