import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { Automaton, StateId } from './types';

export function automatonToReactFlow(
  automaton: Automaton | null,
  activeStates: Set<StateId>
): { nodes: Node[]; edges: Edge[] } {
  if (!automaton) return { nodes: [], edges: [] };

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Group transitions by source → target so multiple symbols share one edge label
  const edgeMap = new Map<string, { source: string; target: string; symbols: Set<string> }>();

  for (const transitionId in automaton.transitions) {
    const t = automaton.transitions[transitionId];
    const key = `${t.source}-${t.target}`;

    if (!edgeMap.has(key)) {
      edgeMap.set(key, { source: t.source, target: t.target, symbols: new Set() });
    }

    edgeMap.get(key)!.symbols.add(t.symbol === '' ? 'ε' : t.symbol);
  }

  // ── Nodes ────────────────────────────────────────────────────────────────
  let defaultX = 100;
  for (const stateId in automaton.states) {
    const state = automaton.states[stateId];
    nodes.push({
      id: state.id,
      type: 'stateNode',
      position: state.position || { x: defaultX, y: 200 },
      data: {
        label: state.label,
        isInitial: state.isInitial,
        isFinal: state.isFinal,
        isActive: activeStates.has(state.id),
      },
    });
    defaultX += 180;
  }

  // ── Edges ────────────────────────────────────────────────────────────────
  // Track how many non-self edges exist between each unordered pair so we
  // can offset them (prevents overlapping bidirectional edges).
  const pairCount = new Map<string, number>();
  for (const [, data] of edgeMap) {
    if (data.source !== data.target) {
      const pairKey = [data.source, data.target].sort().join('|');
      pairCount.set(pairKey, (pairCount.get(pairKey) ?? 0) + 1);
    }
  }

  const pairSeen = new Map<string, number>();

  for (const [key, data] of edgeMap.entries()) {
    const isSelfLoop = data.source === data.target;
    const isActive = activeStates.has(data.source);
    const labelStr = Array.from(data.symbols).join(', ');

    const strokeColor = isActive ? 'var(--accent-primary)' : 'var(--text-secondary)';

    if (isSelfLoop) {
      edges.push({
        id: `e-${key}`,
        source: data.source,
        target: data.target,
        label: labelStr,
        type: 'selfLoop',
        animated: isActive,
        style: { stroke: strokeColor, strokeWidth: isActive ? 2 : 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
      });
    } else {
      const pairKey = [data.source, data.target].sort().join('|');
      const pairTotal = pairCount.get(pairKey) ?? 1;
      const seenIdx = pairSeen.get(pairKey) ?? 0;
      pairSeen.set(pairKey, seenIdx + 1);

      // If there are edges in both directions between two states, curve them
      // so they don't overlap.
      const curvature = pairTotal > 1 ? 0.5 : 0.25;

      edges.push({
        id: `e-${key}`,
        source: data.source,
        target: data.target,
        label: labelStr,
        type: 'bezier',
        animated: isActive,
        style: { stroke: strokeColor, strokeWidth: isActive ? 2 : 1.5 },
        labelStyle: { fill: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 },
        labelBgStyle: { fill: 'var(--bg-secondary)', fillOpacity: 0.9 },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
        data: { curvature },
      });
    }
  }

  return { nodes, edges };
}
