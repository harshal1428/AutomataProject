import type { TuringMachine, StateId } from './types';

export function computeTMStep(
  tm: TuringMachine,
  stateId: StateId,
  tape: string[],
  head: number
): { stateId: StateId; tape: string[]; head: number } | null {
  // Get current symbol at head, handle blanks
  const symbol = tape[head] || tm.blankSymbol;
  
  // Find transition
  let activeTransition = null;
  for (const transitionId in tm.transitions) {
    const t = tm.transitions[transitionId];
    if (t.source === stateId && t.symbol === symbol) {
      activeTransition = t;
      break;
    }
  }

  if (!activeTransition) return null;

  // Perform write
  const newTape = [...tape];
  newTape[head] = activeTransition.writeSymbol;

  // Perform move
  let newHead = head;
  if (activeTransition.moveDirection === 'L') {
    newHead = head - 1;
  } else if (activeTransition.moveDirection === 'R') {
    newHead = head + 1;
  }

  // Handle padding for infinite tape simulation
  if (newHead < 0) {
    newTape.unshift(tm.blankSymbol);
    newHead = 0;
  } else if (newHead >= newTape.length) {
    newTape.push(tm.blankSymbol);
  }

  return {
    stateId: activeTransition.target,
    tape: newTape,
    head: newHead
  };
}
