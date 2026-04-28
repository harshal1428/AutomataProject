import type { Automaton } from './types';

// Primary DFA: 4-state visual email validator.
export const sampleDFA: Automaton = {
  alphabet: new Set(['local', '@', 'a-z', '.', 'other']),
  metadata: {
    name: '4-State Email DFA',
    description: 'Visual DFA for email pattern local@[a-z]+.[a-z]{2,3}.',
    complexity: 'O(n)',
    symbolMode: 'class',
    enforceEmailPolicyAtEOF: true,
  },
  states: {
    'q0': { id: 'q0', label: 'q0', isInitial: true, isFinal: false, position: { x: 110, y: 200 } },
    'q1': { id: 'q1', label: 'q1', isInitial: false, isFinal: false, position: { x: 320, y: 200 } },
    'q2': { id: 'q2', label: 'q2', isInitial: false, isFinal: true, position: { x: 530, y: 200 } },
    'q3': { id: 'q3', label: 'q3', isInitial: false, isFinal: false, position: { x: 740, y: 200 } },
  },
  transitions: {
    't1': { id: 't1', source: 'q0', target: 'q0', symbol: 'local' },
    't2': { id: 't2', source: 'q0', target: 'q1', symbol: '@' },
    't3': { id: 't3', source: 'q1', target: 'q1', symbol: 'a-z' },
    't4': { id: 't4', source: 'q1', target: 'q2', symbol: '.' },
    't5': { id: 't5', source: 'q2', target: 'q2', symbol: 'a-z' },
    't6': { id: 't6', source: 'q0', target: 'q3', symbol: 'other' },
    't7': { id: 't7', source: 'q1', target: 'q3', symbol: 'other' },
    't8': { id: 't8', source: 'q2', target: 'q3', symbol: 'other' },
    't9': { id: 't9', source: 'q3', target: 'q3', symbol: 'local' },
    't10': { id: 't10', source: 'q3', target: 'q3', symbol: '@' },
    't11': { id: 't11', source: 'q3', target: 'q3', symbol: 'a-z' },
    't12': { id: 't12', source: 'q3', target: 'q3', symbol: '.' },
    't13': { id: 't13', source: 'q3', target: 'q3', symbol: 'other' },
  }
};

// Secondary visual reference in lower pane.
export const samplePasswordDFA: Automaton = {
  alphabet: new Set(['a-z', 'A-Z', '0-9', '$@#']),
  metadata: {
    name: '4-State Password DFA',
    description: 'Class-based password DFA with strong policy enforcement at EOF.',
    complexity: 'O(n)',
    symbolMode: 'class',
    enforceStrongPolicyAtEOF: true,
  },
  states: {
    'q0': { id: 'q0', label: 'q0', isInitial: true, isFinal: false, position: { x: 100, y: 200 } },
    'q1': { id: 'q1', label: 'q1', isInitial: false, isFinal: false, position: { x: 300, y: 200 } },
    'q2': { id: 'q2', label: 'q2', isInitial: false, isFinal: true, position: { x: 500, y: 200 } },
    'q3': { id: 'q3', label: 'q3', isInitial: false, isFinal: false, position: { x: 700, y: 200 } },
  },
  transitions: {
    // q0
    't1': { id: 't1', source: 'q0', target: 'q1', symbol: '$@#' },
    't2': { id: 't2', source: 'q0', target: 'q0', symbol: 'a-z' },
    't3': { id: 't3', source: 'q0', target: 'q0', symbol: 'A-Z' },
    't4': { id: 't4', source: 'q0', target: 'q0', symbol: '0-9' },

    // q1
    't5': { id: 't5', source: 'q1', target: 'q1', symbol: 'a-z' },
    't6': { id: 't6', source: 'q1', target: 'q1', symbol: 'A-Z' },
    't7': { id: 't7', source: 'q1', target: 'q2', symbol: '0-9' },
    't8': { id: 't8', source: 'q1', target: 'q0', symbol: '$@#' },

    // q2 (accepting sink)
    't9': { id: 't9', source: 'q2', target: 'q2', symbol: 'a-z' },
    't10': { id: 't10', source: 'q2', target: 'q2', symbol: 'A-Z' },
    't11': { id: 't11', source: 'q2', target: 'q2', symbol: '0-9' },
    't12': { id: 't12', source: 'q2', target: 'q2', symbol: '$@#' },

    // q3 dead sink
    't13': { id: 't13', source: 'q3', target: 'q3', symbol: 'a-z' },
    't14': { id: 't14', source: 'q3', target: 'q3', symbol: 'A-Z' },
    't15': { id: 't15', source: 'q3', target: 'q3', symbol: '0-9' },
    't16': { id: 't16', source: 'q3', target: 'q3', symbol: '$@#' },
  }
};

// NFA: Accepts strings containing LOWER then DIGIT (class-based) with non-deterministic branch.
export const sampleNFA: Automaton = {
  alphabet: new Set(['a-z', 'A-Z', '0-9', '$@#']),
  metadata: {
    name: 'Class-based NFA (contains lower->digit)',
    description: 'NFA using class ranges with branching to highlight DFA vs NFA trace differences.',
    complexity: 'O(2^n) theoretical',
    symbolMode: 'class',
  },
  states: {
    's0': { id: 's0', label: 's0', isInitial: true, isFinal: false, position: { x: 100, y: 200 } },
    's1': { id: 's1', label: 's1', isInitial: false, isFinal: false, position: { x: 300, y: 200 } },
    's2': { id: 's2', label: 's2', isInitial: false, isFinal: true, position: { x: 500, y: 200 } },
  },
  transitions: {
    'n1': { id: 'n1', source: 's0', target: 's0', symbol: 'a-z' },
    'n2': { id: 'n2', source: 's0', target: 's0', symbol: 'A-Z' },
    'n3': { id: 'n3', source: 's0', target: 's0', symbol: '0-9' },
    'n4': { id: 'n4', source: 's0', target: 's0', symbol: '$@#' },
    'n5': { id: 'n5', source: 's0', target: 's1', symbol: 'a-z' }, // Nondeterministic split on lower
    'n6': { id: 'n6', source: 's1', target: 's2', symbol: '0-9' },
    'n7': { id: 'n7', source: 's2', target: 's2', symbol: 'a-z' },
    'n8': { id: 'n8', source: 's2', target: 's2', symbol: 'A-Z' },
    'n9': { id: 'n9', source: 's2', target: 's2', symbol: '0-9' },
    'n10': { id: 'n10', source: 's2', target: 's2', symbol: '$@#' },
  }
};

export const sampleEmailNFA: Automaton = {
  alphabet: new Set(['local', '@', 'a-z', '.', 'other']),
  metadata: {
    name: 'Email NFA',
    description: 'NFA for email validation with nondeterministic local part handling.',
    complexity: 'O(2^n)',
    symbolMode: 'class',
    enforceEmailPolicyAtEOF: true,
  },
  states: {
    'q0': { id: 'q0', label: 'q0', isInitial: true, isFinal: false, position: { x: 110, y: 200 } },
    'q1': { id: 'q1', label: 'q1', isInitial: false, isFinal: false, position: { x: 320, y: 200 } },
    'q2': { id: 'q2', label: 'q2', isInitial: false, isFinal: true, position: { x: 530, y: 200 } },
    'q3': { id: 'q3', label: 'q3', isInitial: false, isFinal: false, position: { x: 740, y: 200 } },
  },
  transitions: {
    'e1': { id: 'e1', source: 'q0', target: 'q0', symbol: 'local' },
    'e2': { id: 'e2', source: 'q0', target: 'q1', symbol: '@' },
    'e3': { id: 'e3', source: 'q1', target: 'q1', symbol: 'a-z' },
    'e4': { id: 'e4', source: 'q1', target: 'q2', symbol: '.' },
    'e5': { id: 'e5', source: 'q2', target: 'q2', symbol: 'a-z' },
  }
};

export const samplePasswordNFA: Automaton = {
  alphabet: new Set(['a-z', 'A-Z', '0-9', '$@#']),
  metadata: {
    name: 'Password NFA',
    description: 'NFA for password validation with nondeterministic special character check.',
    complexity: 'O(2^n)',
    symbolMode: 'class',
    enforceStrongPolicyAtEOF: true,
  },
  states: {
    'q0': { id: 'q0', label: 'q0', isInitial: true, isFinal: false, position: { x: 100, y: 200 } },
    'q1': { id: 'q1', label: 'q1', isInitial: false, isFinal: false, position: { x: 300, y: 200 } },
    'q2': { id: 'q2', label: 'q2', isInitial: false, isFinal: true, position: { x: 500, y: 200 } },
    'q3': { id: 'q3', label: 'q3', isInitial: false, isFinal: false, position: { x: 700, y: 200 } },
  },
  transitions: {
    'p1': { id: 'p1', source: 'q0', target: 'q0', symbol: 'a-z' },
    'p2': { id: 'p2', source: 'q0', target: 'q0', symbol: 'A-Z' },
    'p3': { id: 'p3', source: 'q0', target: 'q0', symbol: '0-9' },
    'p4': { id: 'p4', source: 'q0', target: 'q1', symbol: '$@#' },
    'p5': { id: 'p5', source: 'q1', target: 'q1', symbol: 'a-z' },
    'p6': { id: 'p6', source: 'q1', target: 'q1', symbol: 'A-Z' },
    'p7': { id: 'p7', source: 'q1', target: 'q2', symbol: '0-9' },
    'p8': { id: 'p8', source: 'q1', target: 'q1', symbol: '$@#' },
  }
};


