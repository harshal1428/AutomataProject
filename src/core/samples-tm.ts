import type { TuringMachine } from './types';

// TM: Password Strength Analyzer
// Pass 1: Scan for length (move right until B)
// Pass 2: Write result 'S' if length >= 5 (simple for demo)
export const strengthTM: TuringMachine = {
  alphabet: new Set(['a', 'b', 'c', '1', '2', '3']),
  tapeAlphabet: new Set(['a', 'b', 'c', '1', '2', '3', 'B', 'S', 'W']),
  blankSymbol: 'B',
  states: {
    'start': { id: 'start', label: 'Start', isInitial: true, isFinal: false, position: { x: 100, y: 200 } },
    'scan': { id: 'scan', label: 'Scanning', isInitial: false, isFinal: false, position: { x: 300, y: 200 } },
    'accept': { id: 'accept', label: 'Done', isInitial: false, isFinal: true, position: { x: 500, y: 200 } },
  },
  transitions: {
    // Initial move
    't0': { id: 't0', source: 'start', target: 'scan', symbol: 'B', writeSymbol: 'B', moveDirection: 'R' },
    
    // Scan through alphanumeric
    ...['a', 'b', 'c', '1', '2', '3'].reduce((acc, sym) => ({
      ...acc,
      [`t-${sym}`]: { id: `t-${sym}`, source: 'scan', target: 'scan', symbol: sym, writeSymbol: sym, moveDirection: 'R' }
    }), {}),

    // Reached end: Write 'S' and Halt
    't-end': { id: 't-end', source: 'scan', target: 'accept', symbol: 'B', writeSymbol: 'S', moveDirection: 'S' },
  }
};
