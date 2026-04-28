import React, { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { useFiniteAutomaton } from './hooks/useFiniteAutomaton';
import { sampleDFA, samplePasswordDFA, sampleEmailNFA, samplePasswordNFA } from './core/samples';
import { completeDFA, minimizeDFA, nfaToDFA } from './core/dfa-utils';
import './App.css';

const App: React.FC = () => {
  const [automatonType, setAutomatonType] = useState<'DFA' | 'NFA'>('DFA');
  const [isDFAMinimized, setIsDFAMinimized] = useState(false);

  const normalizedDFA = useMemo(() => completeDFA(sampleDFA), []);
  const minimizedDFA = useMemo(() => minimizeDFA(normalizedDFA), [normalizedDFA]);
  const dfaForUse = isDFAMinimized ? minimizedDFA : normalizedDFA;

  const normalizedNFA = useMemo(() => sampleEmailNFA, []);
  const minimizedNFA = useMemo(() => minimizeDFA(nfaToDFA(sampleEmailNFA)), []);
  const nfaForUse = isDFAMinimized ? minimizedNFA : normalizedNFA;

  const normalizedPasswordNFA = useMemo(() => samplePasswordNFA, []);
  const minimizedPasswordNFA = useMemo(() => minimizeDFA(nfaToDFA(samplePasswordNFA)), []);
  const passwordNFAForUse = isDFAMinimized ? minimizedPasswordNFA : normalizedPasswordNFA;

  const emailEngine = useFiniteAutomaton(
    automatonType === 'DFA' ? dfaForUse : nfaForUse
  );
  const passwordEngine = useFiniteAutomaton(
    automatonType === 'DFA' ? samplePasswordDFA : passwordNFAForUse
  );

  const engine = emailEngine;
  const automaton = automatonType === 'DFA' ? dfaForUse : nfaForUse;

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <h1 className="text-gradient">Automata Theory Visualizer</h1>
        <div className="app-header-actions">
          <div className="sigma-hint">Σ = &#123; local, @, a-z, ., other &#125;</div>
          <a
            className="dfa-simulator-button"
            href="https://dfa-simulator-opal.vercel.app"
          >
            DFA Simulator
          </a>
        </div>
      </header>
      <main className="app-main">
        <Sidebar
          automatonType={automatonType}
          setAutomatonType={(type) => {
            setAutomatonType(type);
            if (type !== 'DFA') setIsDFAMinimized(false);
          }}
          isDFAMinimized={isDFAMinimized}
          onToggleDFAMinimize={() => setIsDFAMinimized((prev) => !prev)}
          automaton={automaton}
          engine={engine}
          secondaryEngine={passwordEngine}
        />
        <Canvas
          automaton={automaton}
          activeStates={engine.currentStates}
          secondaryAutomaton={automatonType === 'DFA' ? samplePasswordDFA : passwordNFAForUse}
          secondaryActiveStates={passwordEngine.currentStates}
          secondaryTitle={automatonType === 'DFA' ? 'Password DFA (Lower Reference Pane)' : 'Password NFA (Lower Reference Pane)'}
          primaryTitle={automatonType === 'DFA' ? 'Email DFA (Upper Interactive Pane)' : 'Email NFA (Upper Interactive Pane)'}
        />
      </main>
    </div>
  );
};

export default App;
