import { useState, useCallback, useEffect } from 'react';
import type { Automaton, StateId, TraceEntry } from '../core/types';
import { computeEpsilonClosure, computeNextStates, isAccepted } from '../core/engine';
import { getSymbolClass } from '../core/symbol-classes';
import { checkStrongPassword } from '../core/password-policy';
import { checkEmailPolicy } from '../core/email-policy';

export type AutomatonStatus = 'idle' | 'running' | 'accepted' | 'rejected';

export function useFiniteAutomaton(automaton: Automaton | null) {
  const [input, setInput] = useState('');
  const [pointer, setPointer] = useState(0);
  const [currentStates, setCurrentStates] = useState<Set<StateId>>(new Set());
  const [status, setStatus] = useState<AutomatonStatus>('idle');
  const [trace, setTrace] = useState<TraceEntry[]>([]);

  // Helper to find initial states + apply epsilon closure
  const getStartStates = (a: Automaton): Set<StateId> => {
    const initialStates = new Set<StateId>();
    for (const stateId in a.states) {
      if (a.states[stateId].isInitial) initialStates.add(stateId);
    }
    return computeEpsilonClosure(a, initialStates);
  };

  // Initialize when automaton or input changes
  useEffect(() => {
    if (!automaton) return;
    const startStates = getStartStates(automaton);
    setCurrentStates(startStates);
    setPointer(0);
    setStatus('idle');
    setTrace([]);
  }, [automaton]);

  const reset = useCallback((newInput?: string) => {
    if (newInput !== undefined) setInput(newInput);
    setPointer(0);
    setStatus('idle');
    setTrace([]);
    if (automaton) {
      setCurrentStates(getStartStates(automaton));
    } else {
      setCurrentStates(new Set());
    }
  }, [automaton]);

  const step = useCallback(() => {
    if (!automaton || status === 'accepted' || status === 'rejected') return;

    if (status === 'idle') setStatus('running');

    const enforcePolicy = Boolean(automaton.metadata?.enforceStrongPolicyAtEOF);
    const enforceEmailPolicy = Boolean(automaton.metadata?.enforceEmailPolicyAtEOF);

    const pickStateId = (preferred: StateId[], fallbackToFinal = false): StateId | null => {
      if (automaton.metadata?.originalToMinimized) {
        const mapping = automaton.metadata.originalToMinimized as Record<StateId, StateId>;
        for (const id of preferred) {
          if (mapping[id]) return mapping[id];
        }
      }

      for (const id of preferred) {
        if (automaton.states[id]) return id;
      }
      for (const sid in automaton.states) {
        const s = automaton.states[sid];
        if (fallbackToFinal ? s.isFinal : !s.isFinal) {
          return sid;
        }
      }
      return null;
    };

    if (pointer >= input.length) {
      // End of input — decide accept/reject
      const dfaAccepted = isAccepted(automaton, currentStates);
      const policyResult = checkStrongPassword(input);
      const emailResult = checkEmailPolicy(input);
      const accepted = enforcePolicy ? policyResult.ok : enforceEmailPolicy ? emailResult.ok : dfaAccepted;
      const newStatus = accepted ? 'accepted' : 'rejected';

      if (enforcePolicy) {
        const terminalId = accepted
          ? pickStateId(['q2'], true)
          : pickStateId(['q3', 'q1'], false);
        if (terminalId) setCurrentStates(new Set([terminalId]));
      }

      if (enforceEmailPolicy) {
        const terminalId = accepted
          ? pickStateId(['q2'], true)
          : pickStateId(['q3', 'q1', 'q0'], false);
        if (terminalId) setCurrentStates(new Set([terminalId]));
      }

      const fromState = Array.from(currentStates)[0] || '∅';
      const eofTarget = accepted ? (enforceEmailPolicy ? 'q2' : fromState) : (enforceEmailPolicy ? 'q3' : fromState);

      setStatus(newStatus);
      setTrace(prev => [
        ...prev,
        {
          step: prev.length + 1,
          state: fromState,
          symbol: 'λ',
          description:
            newStatus === 'accepted'
              ? `δ(${fromState}, λ) = ${eofTarget}  ✓ Accepted`
              : enforcePolicy && !policyResult.ok
                ? `δ(${fromState}, λ) = ${eofTarget}  ✗ Rejected (strong policy failed)`
                : enforceEmailPolicy && !emailResult.ok
                  ? `δ(${fromState}, λ) = ${eofTarget}  ✗ Rejected (email policy failed)`
                  : `δ(${fromState}, λ) = ${eofTarget}  ✗ Rejected`,
        },
      ]);
      return;
    }

    if (enforceEmailPolicy) {
      const rawSymbol = input[pointer];
      const consumed = input.slice(0, pointer + 1);
      const fromState = Array.from(currentStates)[0] || 'q0';

      // Prefix parser for visual-state updates in 4-state email DFA.
      const getEmailVisualState = (prefix: string): StateId => {
        const atCount = (prefix.match(/@/g) ?? []).length;
        if (atCount > 1) return 'q3';

        const atIndex = prefix.indexOf('@');
        if (atIndex < 0) {
          return /^[A-Za-z0-9._]+$/.test(prefix) && prefix.length > 0 ? 'q0' : 'q3';
        }

        const local = prefix.slice(0, atIndex);
        const rest = prefix.slice(atIndex + 1);
        if (!/^[A-Za-z0-9._]+$/.test(local) || local.length === 0) return 'q3';

        if (rest.length === 0) return 'q1';

        const dotCount = (rest.match(/\./g) ?? []).length;
        if (dotCount > 1) return 'q3';

        const dotIndex = rest.indexOf('.');
        if (dotIndex < 0) {
          return /^[a-z]+$/.test(rest) ? 'q1' : 'q3';
        }

        const domain = rest.slice(0, dotIndex);
        const ext = rest.slice(dotIndex + 1);
        if (!/^[a-z]+$/.test(domain) || domain.length === 0) return 'q3';
        if (!/^[a-z]*$/.test(ext)) return 'q3';
        if (ext.length > 3) return 'q3';
        return 'q2';
      };

      let toState = getEmailVisualState(consumed);
      
      // Map original state ID to minimized state ID if applicable
      if (automaton.metadata?.originalToMinimized) {
        const mapping = automaton.metadata.originalToMinimized as Record<StateId, StateId>;
        if (mapping[toState]) {
          toState = mapping[toState];
        }
      }

      setCurrentStates(new Set([toState]));

      setTrace(prev => [
        ...prev,
        {
          step: prev.length + 1,
          state: fromState,
          symbol: `'${rawSymbol}'`,
          description: `δ(${fromState}, '${rawSymbol}') = ${toState}`,
        },
      ]);

      setPointer(prev => prev + 1);
      return;
    }

    if (enforcePolicy) {
      const rawSymbol = input[pointer];
      const consumed = input.slice(0, pointer + 1);
      const firstSpecialIdx = consumed.search(/[$@#]/);

      let visualState = pickStateId(['q0'], false);

      if (firstSpecialIdx >= 0) {
        const afterSpecial = consumed.slice(firstSpecialIdx + 1);
        const hasSecondSpecial = /[$@#]/.test(afterSpecial);

        if (hasSecondSpecial || /[a-zA-Z]/.test(afterSpecial)) {
          visualState = pickStateId(['q3'], false);
        } else if (afterSpecial.length === 0) {
          visualState = pickStateId(['q1'], false);
        } else if (/^[0-9]+$/.test(afterSpecial)) {
          visualState = pickStateId(['q2'], true);
        } else {
          visualState = pickStateId(['q3'], false);
        }
      }

      // Map original state ID to minimized state ID if applicable
      if (visualState && automaton.metadata?.originalToMinimized) {
        const mapping = automaton.metadata.originalToMinimized as Record<StateId, StateId>;
        if (mapping[visualState]) {
          visualState = mapping[visualState];
        }
      }

      if (visualState) setCurrentStates(new Set([visualState]));

      const charLabel = 
        rawSymbol === '@' ? "'@' (special)" :
        rawSymbol === '#' ? "'#' (special)" :
        rawSymbol === '$' ? "'$' (special)" :
        `'${rawSymbol}'`;

      setTrace(prev => [
        ...prev,
        {
          step: prev.length + 1,
          state: Array.from(currentStates)[0] || 'q0',
          symbol: charLabel,
          description: `δ(${Array.from(currentStates)[0] || 'q0'}, ${charLabel}) = ${visualState ?? '∅'}`,
        },
      ]);

      setPointer(prev => prev + 1);
      return;
    }

    const rawSymbol = input[pointer];
    const symbol =
      automaton.metadata?.symbolMode === 'class' ? getSymbolClass(rawSymbol) : rawSymbol;

    const nextStates = computeNextStates(automaton, currentStates, symbol);
    const fromLabel = Array.from(currentStates).join(', ') || '∅';
    const toLabel = Array.from(nextStates).join(', ') || '∅ (dead)';

    setTrace(prev => [
      ...prev,
      {
        step: prev.length + 1,
        state: fromLabel,
        symbol: `'${rawSymbol}'${automaton.metadata?.symbolMode === 'class' ? ` → [${symbol}]` : ''}`,
        description: `δ({${fromLabel}}, ${symbol}) = {${toLabel}}`,
      },
    ]);

    setCurrentStates(nextStates);
    setPointer(prev => prev + 1);

    if (nextStates.size === 0) setStatus('rejected');
  }, [automaton, input, pointer, currentStates, status]);

  return {
    input,
    pointer,
    currentStates,
    status,
    trace,
    step,
    reset,
    setInput,
  };
}
