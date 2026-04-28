import React from 'react';
import { type EdgeProps, EdgeLabelRenderer } from '@xyflow/react';

/**
 * SelfLoopEdge — renders a loopback arc above the node when source === target.
 * Built-in ReactFlow edge types don't handle self-loops, so we draw an SVG arc.
 */
export const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  label,
  style,
  markerEnd,
}) => {
  const loopRadius = 40;
  const cx = sourceX;
  const cy = sourceY - loopRadius * 2.2;

  const d = `M ${sourceX} ${sourceY - 2}
    C ${cx - loopRadius * 1.5} ${cy - loopRadius},
      ${cx + loopRadius * 1.5} ${cy - loopRadius},
      ${sourceX} ${sourceY - 2}`;

  const labelX = cx;
  const labelY = cy - loopRadius * 0.6;

  return (
    <>
      <path
        id={id}
        d={d}
        style={style}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        fill="none"
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              background: 'var(--bg-secondary)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
