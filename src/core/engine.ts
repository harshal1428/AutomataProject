import type { Automaton, StateId, Symbol } from './types';

export function computeEpsilonClosure(
  automaton: Automaton,
  states: Set<StateId>
): Set<StateId> {
  const closure = new Set<StateId>(states);
  const stack = Array.from(states);

  while (stack.length > 0) {
    const currentStateId = stack.pop()!;
    
    // Find all epsilon transitions from currentStateId
    for (const transitionId in automaton.transitions) {
      const transition = automaton.transitions[transitionId];
      if (
        transition.source === currentStateId &&
        transition.symbol === "" && // "" represents epsilon
        !closure.has(transition.target)
      ) {
        closure.add(transition.target);
        stack.push(transition.target);
      }
    }
  }

  return closure;
}

export function computeNextStates(
  automaton: Automaton,
  currentStates: Set<StateId>,
  symbol: Symbol
): Set<StateId> {
  const nextStates = new Set<StateId>();

  // Find all valid transitions for the current input symbol
  for (const transitionId in automaton.transitions) {
    const transition = automaton.transitions[transitionId];
    if (currentStates.has(transition.source) && transition.symbol === symbol) {
      nextStates.add(transition.target);
    }
  }

  // Next states must include their epsilon-closures
  return computeEpsilonClosure(automaton, nextStates);
}

export function isAccepted(
  automaton: Automaton,
  currentStates: Set<StateId>
): boolean {
  for (const stateId of currentStates) {
    const state = automaton.states[stateId];
    if (state && state.isFinal) {
      return true;
    }
  }
  return false;
}
