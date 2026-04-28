export type StateId = string;
export type Symbol = string;

export interface State {
  id: StateId;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  position?: { x: number; y: number };
}

export interface Transition {
  id: string;
  source: StateId;
  target: StateId;
  symbol: Symbol; // ε can be represented as an empty string ""
}

// Base Automaton
export interface Automaton {
  states: Record<StateId, State>;
  transitions: Record<string, Transition>;
  alphabet: Set<Symbol>;
  metadata?: {
    name: string;
    description: string;
    complexity: string;
    symbolMode?: 'raw' | 'password-token' | 'class';
    enforceStrongPolicyAtEOF?: boolean;
    enforceEmailPolicyAtEOF?: boolean;
  };
}

export type DFA = Automaton;

export type NFA = Automaton;

export interface PDATransition extends Transition {
  popSymbol: string;
  pushSymbol: string;
}

export interface PDA extends Omit<Automaton, 'transitions'> {
  transitions: Record<string, PDATransition>;
  stackAlphabet: Set<Symbol>;
}

export interface PDAConfiguration {
  stateId: StateId;
  stack: string[];
}

export interface TMTransition extends Transition {
  writeSymbol: Symbol;
  moveDirection: 'L' | 'R' | 'S'; // Left, Right, Stay
}

export interface TuringMachine extends Omit<Automaton, 'transitions'> {
  transitions: Record<string, TMTransition>;
  tapeAlphabet: Set<Symbol>;
  blankSymbol: Symbol;
}

export interface TraceEntry {
  step: number;
  state: string;
  symbol: string;
  description: string;
}
