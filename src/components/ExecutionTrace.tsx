import React, { useEffect, useRef } from 'react';
import type { TraceEntry } from '../core/types';
import './ExecutionTrace.css';

interface ExecutionTraceProps {
  trace: TraceEntry[];
  status: 'idle' | 'running' | 'accepted' | 'rejected';
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({ trace, status }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trace]);

  if (trace.length === 0) {
    return (
      <div className="et-wrapper et-empty">
        <span>Press <b>Step</b> to begin execution trace</span>
      </div>
    );
  }

  return (
    <div className="et-wrapper">
      <div className="et-header">
        <span className="et-title">Execution Trace</span>
        <span className={`et-status et-status--${status}`}>{status.toUpperCase()}</span>
      </div>
      <div className="et-entries">
        {trace.map((entry, idx) => {
          const isLast = idx === trace.length - 1;
          const isTerminal = isLast && (status === 'accepted' || status === 'rejected');
          return (
            <div
              key={entry.step}
              className={`et-entry ${isLast ? 'et-entry--latest' : ''} ${
                isTerminal
                  ? status === 'accepted'
                    ? 'et-entry--accepted'
                    : 'et-entry--rejected'
                  : ''
              }`}
            >
              <span className="et-step">#{entry.step}</span>
              <div className="et-body">
                <div className="et-desc">{entry.description}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
