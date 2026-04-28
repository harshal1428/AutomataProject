import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Automaton, StateId } from '../core/types';
import { automatonToReactFlow } from '../core/mapper';
import { StateNode } from './StateNode';
import { SelfLoopEdge } from './SelfLoopEdge';

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

const edgeTypes: EdgeTypes = {
  selfLoop: SelfLoopEdge,
};

interface CanvasProps {
  automaton: Automaton | null;
  activeStates: Set<StateId>;
  secondaryAutomaton?: Automaton | null;
  secondaryActiveStates?: Set<StateId>;
  primaryTitle?: string;
  secondaryTitle?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  automaton,
  activeStates,
  secondaryAutomaton,
  secondaryActiveStates,
  primaryTitle,
  secondaryTitle,
}) => {
  const { nodes, edges } = useMemo(() => {
    return automatonToReactFlow(automaton, activeStates);
  }, [automaton, activeStates]);

  const { nodes: secondaryNodes, edges: secondaryEdges } = useMemo(() => {
    return automatonToReactFlow(secondaryAutomaton ?? null, secondaryActiveStates ?? new Set<StateId>());
  }, [secondaryAutomaton, secondaryActiveStates]);

  return (
    <div className="canvas-container glass-panel">
      <div className={`canvas-pane ${secondaryAutomaton ? 'canvas-pane--split' : ''}`}>
        {primaryTitle && <div className="canvas-pane-title">{primaryTitle}</div>}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="rgba(255,255,255,0.04)" />
          <Controls
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          />
        </ReactFlow>
      </div>
      {secondaryAutomaton && (
        <div className="canvas-pane canvas-pane--split">
          {secondaryTitle && <div className="canvas-pane-title">{secondaryTitle}</div>}
          <ReactFlow
            nodes={secondaryNodes}
            edges={secondaryEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="rgba(255,255,255,0.04)" />
            <Controls
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};
