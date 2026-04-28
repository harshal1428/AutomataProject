import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import './StateNode.css';

type StateNodeData = {
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
};

type StateNodeType = Node<StateNodeData, 'stateNode'>;

export const StateNode: React.FC<NodeProps<StateNodeType>> = ({ data }) => {
  const { label, isInitial, isFinal, isActive } = data;

  return (
    <div className={`state-node ${isActive ? 'active' : ''} ${isFinal ? 'final' : ''}`}>
      <Handle type="target" position={Position.Left} id="target" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="source" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="ttop" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="tbottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="tright" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="sleft" style={{ opacity: 0 }} />

      {isInitial && (
        <div className="initial-indicator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}
      
      <div className="state-circle">
        <span className="state-label">{label}</span>
      </div>
    </div>
  );
};
