import type { PDA } from './types';

// PDA: Accepts balanced brackets '()'
export const samplePDA: PDA = {
  alphabet: new Set(['(', ')']),
  stackAlphabet: new Set(['(', '$']),
  states: {
    'q0': { id: 'q0', label: 'q0', isInitial: true, isFinal: false, position: { x: 100, y: 200 } },
    'q1': { id: 'q1', label: 'q1', isInitial: false, isFinal: false, position: { x: 300, y: 200 } },
    'q2': { id: 'q2', label: 'q2', isInitial: false, isFinal: true, position: { x: 500, y: 200 } },
  },
  transitions: {
    // Initial epsilon: push $
    'p0': { id: 'p0', source: 'q0', target: 'q1', symbol: '', popSymbol: "", pushSymbol: "$" },
    // Push on (
    'p1': { id: 'p1', source: 'q1', target: 'q1', symbol: '(', popSymbol: "", pushSymbol: "(" },
    // Pop on )
    'p2': { id: 'p2', source: 'q1', target: 'q1', symbol: ')', popSymbol: "(", pushSymbol: "" },
    // Final epsilon: pop $ and go to q2
    'p3': { id: 'p3', source: 'q1', target: 'q2', symbol: '', popSymbol: "$", pushSymbol: "" },
  }
};
