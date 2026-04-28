import React, { useState } from 'react';
import type { AutomatonStatus } from '../hooks/useFiniteAutomaton';
import type { Automaton, TraceEntry } from '../core/types';
import { TransitionTable } from './TransitionTable';
import { ExecutionTrace } from './ExecutionTrace';
import { checkStrongPassword } from '../core/password-policy';
import { checkEmailPolicy } from '../core/email-policy';

type EngineView = {
  input: string;
  pointer?: number;
  status: AutomatonStatus;
  step: () => void;
  reset: (newInput?: string) => void;
  trace: TraceEntry[];
  currentStates: Set<string>;
};

interface SidebarProps {
  automatonType: 'DFA' | 'NFA';
  setAutomatonType: (type: 'DFA' | 'NFA') => void;
  isDFAMinimized: boolean;
  onToggleDFAMinimize: () => void;
  automaton: Automaton | null;
  engine: EngineView;
  secondaryEngine?: EngineView;
}

type SidebarTab = 'controls' | 'trace' | 'rules' | 'policy';

export const Sidebar: React.FC<SidebarProps> = ({
  automatonType,
  setAutomatonType,
  isDFAMinimized,
  onToggleDFAMinimize,
  automaton,
  engine,
  secondaryEngine,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('controls');
  const policy = checkStrongPassword(engine.input);
  const secondaryPolicy = checkStrongPassword(secondaryEngine?.input ?? '');
  const emailPolicy = checkEmailPolicy(engine.input);
  const isEmailMode = Boolean(automaton?.metadata?.enforceEmailPolicyAtEOF);

  const tabs: { id: SidebarTab; label: string }[] = [
    { id: 'controls', label: 'Controls' },
    { id: 'trace', label: `Trace${engine.trace.length > 0 ? ` (${engine.trace.length})` : ''}` },
    { id: 'rules', label: 'δ Rules' },
    { id: 'policy', label: 'Policy' },
  ];

  return (
    <aside className="sidebar glass-panel">
      {/* Header */}
      <div className="sidebar-section">
        <h2>Automaton Settings</h2>

        <div>
          <h3>Type</h3>
          <select
            className="ui-select"
            value={automatonType}
            onChange={(e) => {
              setAutomatonType(e.target.value as 'DFA' | 'NFA');
              engine.reset(engine.input);
              secondaryEngine?.reset(secondaryEngine.input);
            }}
          >
            <option value="DFA">Deterministic Finite Automaton (DFA)</option>
            <option value="NFA">Non-deterministic Finite Automaton (NFA)</option>
          </select>
          <p className="placeholder-text" style={{ marginTop: '4px' }}>
            {automatonType === 'DFA' && '4-state Email DFA: local@[a-z]+.[a-z]{2,3} (C-style validation).'}
            {automatonType === 'NFA' && 'Class-based NFA with nondeterministic branch on lower case.'}
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onToggleDFAMinimize}
          title="Toggle minimization. For NFAs, this converts to DFA then minimizes. For some DFAs, the graph may look unchanged if already minimal."
        >
          {isDFAMinimized 
            ? '← Show Original' 
            : automatonType === 'DFA' ? '⚡ Minimize DFA' : '⚡ Minimize NFA (to DFA)'}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'sidebar-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sidebar-tab-content">
        {/* ── Controls Tab ─────────────────────────────────── */}
        {activeTab === 'controls' && (
          <div className="sidebar-section" style={{ gap: '12px' }}>
            {secondaryEngine ? (
              <>
                <div>
                  <h3>Email Input</h3>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="Enter email (e.g. harshal@mail.in)"
                    value={engine.input}
                    onChange={(e) => engine.reset(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => engine.reset(engine.input)} style={{ flex: 1 }}>
                      Reset
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={engine.step}
                      disabled={engine.status === 'accepted' || engine.status === 'rejected'}
                      style={{ flex: 2 }}
                    >
                      Step →
                    </button>
                  </div>
                </div>

                {engine.status !== 'idle' && engine.pointer !== undefined && (
                  <div className="input-tape">
                    <span className="input-tape-label">Email Tape</span>
                    <div className="input-tape-chars">
                      {(() => {
                        const emailPointer = engine.pointer as number;
                        return engine.input.split('').map((char, i) => (
                          <span
                            key={i}
                            className={`input-char ${i === emailPointer ? 'current' : i < emailPointer ? 'consumed' : ''}`}
                          >
                            {char}
                          </span>
                        ));
                      })()}
                      {engine.pointer === engine.input.length && (
                        <span className="input-char current" title="Lambda (end of input)">λ</span>
                      )}
                    </div>
                  </div>
                )}

                {engine.status !== 'idle' && (
                  <div className={`status-badge status-badge--${engine.status}`}>
                    {engine.status === 'accepted' && '✓ '}
                    {engine.status === 'rejected' && '✗ '}
                    {engine.status === 'running' && '⏵ '}
                    Email Status: {engine.status.toUpperCase()}
                  </div>
                )}

                <div>
                  <h3>Password Input</h3>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="Enter password (e.g. Vedant21@2005)"
                    value={secondaryEngine.input}
                    onChange={(e) => secondaryEngine.reset(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => secondaryEngine.reset(secondaryEngine.input)} style={{ flex: 1 }}>
                      Reset
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={secondaryEngine.step}
                      disabled={secondaryEngine.status === 'accepted' || secondaryEngine.status === 'rejected'}
                      style={{ flex: 2 }}
                    >
                      Step →
                    </button>
                  </div>
                </div>

                {secondaryEngine.status !== 'idle' && secondaryEngine.pointer !== undefined && (
                  <div className="input-tape">
                    <span className="input-tape-label">Password Tape</span>
                    <div className="input-tape-chars">
                      {(() => {
                        const passwordPointer = secondaryEngine.pointer as number;
                        return secondaryEngine.input.split('').map((char, i) => (
                          <span
                            key={i}
                            className={`input-char ${i === passwordPointer ? 'current' : i < passwordPointer ? 'consumed' : ''}`}
                          >
                            {char}
                          </span>
                        ));
                      })()}
                      {secondaryEngine.pointer === secondaryEngine.input.length && (
                        <span className="input-char current" title="Lambda (end of input)">λ</span>
                      )}
                    </div>
                  </div>
                )}

                {secondaryEngine.status !== 'idle' && (
                  <div className={`status-badge status-badge--${secondaryEngine.status}`}>
                    {secondaryEngine.status === 'accepted' && '✓ '}
                    {secondaryEngine.status === 'rejected' && '✗ '}
                    {secondaryEngine.status === 'running' && '⏵ '}
                    Password Status: {secondaryEngine.status.toUpperCase()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <h3>Test Input</h3>
                  <input
                    type="text"
                    className="ui-input"
                    placeholder={isEmailMode ? 'Enter email (e.g. harshal@mail.in)' : 'Enter string (e.g. aab7)'}
                    value={engine.input}
                    onChange={(e) => engine.reset(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => engine.reset(engine.input)} style={{ flex: 1 }}>
                      Reset
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={engine.step}
                      disabled={engine.status === 'accepted' || engine.status === 'rejected'}
                      style={{ flex: 2 }}
                    >
                      Step →
                    </button>
                  </div>
                </div>

                {engine.status !== 'idle' && engine.pointer !== undefined && (
                  <div className="input-tape">
                    <span className="input-tape-label">Input</span>
                    <div className="input-tape-chars">
                      {(() => {
                        const pointer = engine.pointer as number;
                        return engine.input.split('').map((char, i) => (
                          <span
                            key={i}
                            className={`input-char ${i === pointer ? 'current' : i < pointer ? 'consumed' : ''}`}
                          >
                            {char}
                          </span>
                        ));
                      })()}
                      {engine.pointer === engine.input.length && (
                        <span className="input-char current" title="Lambda (end of input)">λ</span>
                      )}
                    </div>
                  </div>
                )}

                {engine.status !== 'idle' && (
                  <div className={`status-badge status-badge--${engine.status}`}>
                    {engine.status === 'accepted' && '✓ '}
                    {engine.status === 'rejected' && '✗ '}
                    {engine.status === 'running' && '⏵ '}
                    Status: {engine.status.toUpperCase()}
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ── Trace Tab ────────────────────────────────────── */}
        {activeTab === 'trace' && (
          secondaryEngine ? (
            <div className="sidebar-section" style={{ gap: '12px' }}>
              <h3>Email Trace</h3>
              <ExecutionTrace trace={engine.trace} status={engine.status} />
              <h3>Password Trace</h3>
              <ExecutionTrace trace={secondaryEngine.trace} status={secondaryEngine.status} />
            </div>
          ) : (
            <ExecutionTrace trace={engine.trace} status={engine.status} />
          )
        )}

        {/* ── Rules Tab ────────────────────────────────────── */}
        {activeTab === 'rules' && (
          <TransitionTable
            automaton={automaton}
            automatonType={automatonType}
            activeStates={engine.currentStates}
          />
        )}

        {activeTab === 'policy' && (
          <div className="sidebar-section" style={{ gap: '10px' }}>
            <h3>
              {secondaryEngine
                ? 'Email + Password Policies'
                : isEmailMode ? 'Email Validation Policy' : 'Strong Password Policy'}
            </h3>
            {secondaryEngine ? (
              <>
                <p className="placeholder-text" style={{ marginTop: 0 }}>
                  Email: ^[A-Za-z0-9._]+@[a-z]+\.[a-z]{'{'}2,3{'}'}$
                </p>
                <div className={`status-badge status-badge--${emailPolicy.hasLocalPart ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasLocalPart ? '✓' : '✗'} Email local part valid
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasSingleAt ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasSingleAt ? '✓' : '✗'} Email single @ symbol
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasDomainPart ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasDomainPart ? '✓' : '✗'} Email domain is lowercase
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasDot ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasDot ? '✓' : '✗'} Email has dot before extension
                </div>
                <div className={`status-badge status-badge--${emailPolicy.extLenValid ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.extLenValid ? '✓' : '✗'} Email extension length 2-3
                </div>
                <div className={`status-badge status-badge--${emailPolicy.ok ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.ok ? '✓' : '✗'} Email overall: {emailPolicy.ok ? 'PASS' : 'FAIL'}
                </div>
                <p className="placeholder-text" style={{ marginTop: 8 }}>
                  Password: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#]).{'{'}8,{'}'}$
                </p>
                <div className={`status-badge status-badge--${secondaryPolicy.hasLower ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.hasLower ? '✓' : '✗'} Password has lowercase
                </div>
                <div className={`status-badge status-badge--${secondaryPolicy.hasUpper ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.hasUpper ? '✓' : '✗'} Password has uppercase
                </div>
                <div className={`status-badge status-badge--${secondaryPolicy.hasDigit ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.hasDigit ? '✓' : '✗'} Password has digit
                </div>
                <div className={`status-badge status-badge--${secondaryPolicy.hasSpecial ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.hasSpecial ? '✓' : '✗'} Password has special ($@#)
                </div>
                <div className={`status-badge status-badge--${secondaryPolicy.minLength ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.minLength ? '✓' : '✗'} Password length {'>='} 8
                </div>
                <div className={`status-badge status-badge--${secondaryPolicy.ok ? 'accepted' : 'rejected'}`}>
                  {secondaryPolicy.ok ? '✓' : '✗'} Password overall: {secondaryPolicy.ok ? 'PASS' : 'FAIL'}
                </div>
              </>
            ) : isEmailMode ? (
              <>
                <p className="placeholder-text" style={{ marginTop: 0 }}>
                  ^[A-Za-z0-9._]+@[a-z]+\.[a-z]{'{'}2,3{'}'}$
                </p>
                <div className={`status-badge status-badge--${emailPolicy.hasLocalPart ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasLocalPart ? '✓' : '✗'} Local part valid
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasSingleAt ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasSingleAt ? '✓' : '✗'} Single @ symbol
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasDomainPart ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasDomainPart ? '✓' : '✗'} Domain is lowercase
                </div>
                <div className={`status-badge status-badge--${emailPolicy.hasDot ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.hasDot ? '✓' : '✗'} Has dot before extension
                </div>
                <div className={`status-badge status-badge--${emailPolicy.extLenValid ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.extLenValid ? '✓' : '✗'} Extension length 2-3
                </div>
                <div className={`status-badge status-badge--${emailPolicy.ok ? 'accepted' : 'rejected'}`}>
                  {emailPolicy.ok ? '✓' : '✗'} Overall: {emailPolicy.ok ? 'PASS' : 'FAIL'}
                </div>
              </>
            ) : (
              <>
                <p className="placeholder-text" style={{ marginTop: 0 }}>
                  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#]).{'{'}8,{'}'}$
                </p>
                <div className={`status-badge status-badge--${policy.hasLower ? 'accepted' : 'rejected'}`}>
                  {policy.hasLower ? '✓' : '✗'} Has lowercase
                </div>
                <div className={`status-badge status-badge--${policy.hasUpper ? 'accepted' : 'rejected'}`}>
                  {policy.hasUpper ? '✓' : '✗'} Has uppercase
                </div>
                <div className={`status-badge status-badge--${policy.hasDigit ? 'accepted' : 'rejected'}`}>
                  {policy.hasDigit ? '✓' : '✗'} Has digit
                </div>
                <div className={`status-badge status-badge--${policy.hasSpecial ? 'accepted' : 'rejected'}`}>
                  {policy.hasSpecial ? '✓' : '✗'} Has special
                </div>
                <div className={`status-badge status-badge--${policy.minLength ? 'accepted' : 'rejected'}`}>
                  {policy.minLength ? '✓' : '✗'} Length {'>='} 8
                </div>
                <div className={`status-badge status-badge--${policy.ok ? 'accepted' : 'rejected'}`}>
                  {policy.ok ? '✓' : '✗'} Overall: {policy.ok ? 'PASS' : 'FAIL'}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
