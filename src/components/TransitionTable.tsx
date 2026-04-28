import React from 'react';
import type { Automaton } from '../core/types';
import './TransitionTable.css';

interface TransitionTableProps {
  automaton: Automaton | null;
  automatonType: 'DFA' | 'NFA' | 'PDA' | 'TM';
  activeStates: Set<string>;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  automaton,
  automatonType,
  activeStates,
}) => {
  if (!automaton) return null;

  const states = Object.values(automaton.states);
  const alphabet = Array.from(automaton.alphabet).sort();

  // Build a quick lookup: state → symbol → targets[]
  const lookup = new Map<string, Map<string, string[]>>();
  for (const t of Object.values(automaton.transitions)) {
    if (!lookup.has(t.source)) lookup.set(t.source, new Map());
    const row = lookup.get(t.source)!;
    const sym = t.symbol === '' ? 'ε' : t.symbol;
    if (!row.has(sym)) row.set(sym, []);
    row.get(sym)!.push(t.target);
  }

  return (
    <div className="tt-wrapper">
      <div className="tt-header">
        <span className="tt-title">δ Transition Table</span>
        <span className="tt-badge">{automatonType}</span>
      </div>
      <div className="tt-scroll">
        <table className="tt-table">
          <thead>
            <tr>
              <th className="tt-th tt-state-col">State</th>
              {alphabet.map((sym) => (
                <th key={sym} className="tt-th">{sym}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map((state) => {
              const row = lookup.get(state.id);
              const isActive = activeStates.has(state.id);
              return (
                <tr key={state.id} className={`tt-tr ${isActive ? 'tt-tr--active' : ''}`}>
                  <td className="tt-td tt-state-cell">
                    <span className={`tt-state-pill ${state.isInitial ? 'initial' : ''} ${state.isFinal ? 'final' : ''} ${isActive ? 'active' : ''}`}>
                      {state.isInitial && <span className="tt-arrow">→</span>}
                      {state.isFinal && <span className="tt-star">*</span>}
                      {state.label}
                    </span>
                  </td>
                  {alphabet.map((sym) => {
                    const syml = sym === '' ? 'ε' : sym;
                    const targets = row?.get(syml) ?? [];
                    return (
                      <td key={sym} className="tt-td tt-target-cell">
                        {targets.length > 0 ? (
                          targets.map((t) => (
                            <span key={t} className={`tt-target ${activeStates.has(t) ? 'tt-target--active' : ''}`}>
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="tt-dead">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
