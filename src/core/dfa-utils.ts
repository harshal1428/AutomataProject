import type { Automaton, State, StateId, Symbol, Transition } from './types';
import { computeEpsilonClosure, computeNextStates } from './engine';

function cloneAutomaton(dfa: Automaton): Automaton {
  return {
    alphabet: new Set(dfa.alphabet),
    states: { ...dfa.states },
    transitions: Object.fromEntries(Object.entries(dfa.transitions).map(([id, t]) => [id, { ...t }])),
    metadata: dfa.metadata ? { ...dfa.metadata } : undefined,
  };
}

function buildTransitionMap(dfa: Automaton): Map<StateId, Map<Symbol, StateId>> {
  const map = new Map<StateId, Map<Symbol, StateId>>();
  for (const stateId of Object.keys(dfa.states)) {
    map.set(stateId, new Map<Symbol, StateId>());
  }

  for (const t of Object.values(dfa.transitions)) {
    if (!map.has(t.source)) map.set(t.source, new Map<Symbol, StateId>());
    if (!map.get(t.source)!.has(t.symbol)) {
      map.get(t.source)!.set(t.symbol, t.target);
    }
  }

  return map;
}

export function completeDFA(dfa: Automaton): Automaton {
  const completed = cloneAutomaton(dfa);
  const alphabet = Array.from(completed.alphabet);
  const transitionMap = buildTransitionMap(completed);

  let needsDead = false;
  for (const stateId of Object.keys(completed.states)) {
    const row = transitionMap.get(stateId) ?? new Map<Symbol, StateId>();
    for (const symbol of alphabet) {
      if (!row.has(symbol)) {
        needsDead = true;
      }
    }
  }

  const deadId = 'dead';
  if (needsDead && !completed.states[deadId]) {
    completed.states[deadId] = {
      id: deadId,
      label: 'DEAD',
      isInitial: false,
      isFinal: false,
      position: { x: 860, y: 340 },
    };
    transitionMap.set(deadId, new Map<Symbol, StateId>());
  }

  let counter = Object.keys(completed.transitions).length + 1;
  const addTransition = (source: string, target: string, symbol: string) => {
    const id = `c${counter++}`;
    completed.transitions[id] = { id, source, target, symbol };
    if (!transitionMap.has(source)) transitionMap.set(source, new Map<Symbol, StateId>());
    transitionMap.get(source)!.set(symbol, target);
  };

  for (const stateId of Object.keys(completed.states)) {
    const row = transitionMap.get(stateId) ?? new Map<Symbol, StateId>();
    for (const symbol of alphabet) {
      if (!row.has(symbol)) {
        addTransition(stateId, needsDead ? deadId : stateId, symbol);
      }
    }
  }

  if (needsDead) {
    const deadRow = transitionMap.get(deadId) ?? new Map<Symbol, StateId>();
    for (const symbol of alphabet) {
      if (!deadRow.has(symbol)) {
        addTransition(deadId, deadId, symbol);
      }
    }
  }

  return completed;
}

function getInitialStateId(dfa: Automaton): StateId | null {
  for (const stateId of Object.keys(dfa.states)) {
    if (dfa.states[stateId].isInitial) return stateId;
  }
  return null;
}

function reachableStates(dfa: Automaton): Set<StateId> {
  const start = getInitialStateId(dfa);
  if (!start) return new Set<StateId>();

  const transitionMap = buildTransitionMap(dfa);
  const seen = new Set<StateId>([start]);
  const queue: StateId[] = [start];

  while (queue.length > 0) {
    const s = queue.shift()!;
    const row = transitionMap.get(s);
    if (!row) continue;
    for (const target of row.values()) {
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }

  return seen;
}

export function minimizeDFA(inputDfa: Automaton): Automaton {
  const dfa = completeDFA(inputDfa);
  const alphabet = Array.from(dfa.alphabet);
  const transitions = buildTransitionMap(dfa);
  const reachable = reachableStates(dfa);

  if (reachable.size === 0) {
    return dfa;
  }

  const finals = new Set(Array.from(reachable).filter((s) => dfa.states[s].isFinal));
  const nonFinals = new Set(Array.from(reachable).filter((s) => !dfa.states[s].isFinal));

  let partitions: Array<Set<StateId>> = [];
  if (finals.size > 0) partitions.push(finals);
  if (nonFinals.size > 0) partitions.push(nonFinals);

  let changed = true;
  while (changed) {
    changed = false;
    const newPartitions: Array<Set<StateId>> = [];

    for (const group of partitions) {
      const buckets = new Map<string, Set<StateId>>();

      for (const state of group) {
        const signature = alphabet
          .map((symbol) => {
            const target = transitions.get(state)?.get(symbol) ?? state;
            const index = partitions.findIndex((p) => p.has(target));
            return `${symbol}:${index}`;
          })
          .join('|');

        if (!buckets.has(signature)) buckets.set(signature, new Set<StateId>());
        buckets.get(signature)!.add(state);
      }

      if (buckets.size > 1) changed = true;
      newPartitions.push(...buckets.values());
    }

    partitions = newPartitions;
  }

  const initial = getInitialStateId(dfa);

  // Sort partitions by the original state ID (e.g., q0, q1, q2, q3) 
  // so they appear in a logical order in the UI.
  partitions.sort((groupA, groupB) => {
    // If one group has the initial state, it MUST be first.
    if (initial && groupA.has(initial)) return -1;
    if (initial && groupB.has(initial)) return 1;

    const listA = Array.from(groupA).sort();
    const listB = Array.from(groupB).sort();

    // Push 'dead' or 'DEAD' to the end if possible
    const aIsDead = listA.some(s => s.toLowerCase().includes('dead'));
    const bIsDead = listB.some(s => s.toLowerCase().includes('dead'));
    if (aIsDead && !bIsDead) return 1;
    if (!aIsDead && bIsDead) return -1;

    return listA[0].localeCompare(listB[0]);
  });

  const minimizedStates: Record<StateId, State> = {};
  const stateRep = new Map<StateId, StateId>();
  const originalToMinimized: Record<StateId, StateId> = {};

  partitions.forEach((group, idx) => {
    const members = Array.from(group).sort(); // Keep member list sorted for the label
    const id = `M${idx}`;
    const label = members.join(',');
    const isInitial = initial ? group.has(initial) : false;
    const isFinal = members.some((m) => dfa.states[m].isFinal);

    minimizedStates[id] = {
      id,
      label,
      isInitial,
      isFinal,
      position: { x: 160 + idx * 220, y: 220 },
    };

    for (const m of members) {
      stateRep.set(m, id);
      
      // If the input DFA already has a mapping, propagate it
      if (dfa.metadata?.originalToMinimized) {
        const prevMapping = dfa.metadata.originalToMinimized as Record<StateId, StateId>;
        for (const [origId, dfaId] of Object.entries(prevMapping)) {
          if (dfaId === m) {
            originalToMinimized[origId] = id;
          }
        }
      } else {
        originalToMinimized[m] = id;
      }
    }
  });

  const minimizedTransitions: Record<string, Transition> = {};
  let tid = 1;
  const seenEdges = new Set<string>();

  for (const group of partitions) {
    const representative = Array.from(group)[0];
    const sourceMin = stateRep.get(representative)!;

    for (const symbol of alphabet) {
      const target = transitions.get(representative)?.get(symbol);
      if (!target) continue;
      const targetMin = stateRep.get(target);
      if (!targetMin) continue;

      const dedupe = `${sourceMin}-${targetMin}-${symbol}`;
      if (seenEdges.has(dedupe)) continue;
      seenEdges.add(dedupe);

      const id = `m${tid++}`;
      minimizedTransitions[id] = {
        id,
        source: sourceMin,
        target: targetMin,
        symbol,
      };
    }
  }

  return {
    alphabet: new Set(dfa.alphabet),
    states: minimizedStates,
    transitions: minimizedTransitions,
    metadata: {
      name: `${dfa.metadata?.name ?? 'DFA'} (Minimized)`,
      description: 'Minimized DFA using partition refinement; unreachable and equivalent states removed.',
      complexity: 'Partition-refinement minimization',
      symbolMode: dfa.metadata?.symbolMode ?? 'raw',
      originalToMinimized,
      enforceStrongPolicyAtEOF: dfa.metadata?.enforceStrongPolicyAtEOF,
      enforceEmailPolicyAtEOF: dfa.metadata?.enforceEmailPolicyAtEOF,
    },
  };
}

export function nfaToDFA(nfa: Automaton): Automaton {
  const alphabet = Array.from(nfa.alphabet);
  const initialStates = new Set<StateId>();
  for (const sid in nfa.states) {
    if (nfa.states[sid].isInitial) initialStates.add(sid);
  }
  const startSet = computeEpsilonClosure(nfa, initialStates);
  const startKey = Array.from(startSet).sort().join(',');

  const dfaStates: Record<StateId, State> = {};
  const dfaTransitions: Record<string, Transition> = {};
  const processedSets = new Map<string, StateId>();
  const queue: Array<Set<StateId>> = [startSet];

  const getDFAStateId = (set: Set<StateId>): StateId => {
    const key = Array.from(set).sort().join(',');
    if (processedSets.has(key)) return processedSets.get(key)!;

    const id = `D${processedSets.size}`;
    processedSets.set(key, id);
    dfaStates[id] = {
      id,
      label: key || '∅',
      isInitial: key === startKey,
      isFinal: Array.from(set).some(s => nfa.states[s].isFinal),
      position: { x: 100 + processedSets.size * 200, y: 200 },
    };
    return id;
  };

  getDFAStateId(startSet);
  let tid = 1;

  while (queue.length > 0) {
    const currentSet = queue.shift()!;
    const sourceId = getDFAStateId(currentSet);

    for (const symbol of alphabet) {
      if (symbol === "") continue; // Skip epsilon

      const nextSet = computeNextStates(nfa, currentSet, symbol);
      if (nextSet.size === 0) continue;

      const nextKey = Array.from(nextSet).sort().join(',');
      if (!processedSets.has(nextKey)) {
        queue.push(nextSet);
      }
      
      const targetId = getDFAStateId(nextSet);
      const transitionId = `nt${tid++}`;
      dfaTransitions[transitionId] = {
        id: transitionId,
        source: sourceId,
        target: targetId,
        symbol
      };
    }
  }

  return {
    alphabet: new Set(nfa.alphabet),
    states: dfaStates,
    transitions: dfaTransitions,
    metadata: {
      name: `${nfa.metadata?.name ?? 'NFA'} (DFA Conversion)`,
      description: 'DFA generated from NFA using subset construction.',
      complexity: 'Subset construction (O(2^n))',
      symbolMode: nfa.metadata?.symbolMode ?? 'raw',
      enforceEmailPolicyAtEOF: nfa.metadata?.enforceEmailPolicyAtEOF,
      enforceStrongPolicyAtEOF: nfa.metadata?.enforceStrongPolicyAtEOF,
      originalToMinimized: Object.fromEntries(
        Array.from(processedSets.entries()).flatMap(([key, dfaId]) => {
          const nfaIds = key.split(',');
          return nfaIds.map(nfaId => [nfaId, dfaId]);
        })
      )
    }
  };
}
