import { getConnectedEdges, getIncomers, getOutgoers } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { MouseEvent, useCallback, useMemo, useState } from 'react';

const stripClasses = (cls: string, ...toRemove: string[]) =>
  cls
    .replace(new RegExp(String.raw`\b(${toRemove.join('|')})\b`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();

export function useNodeHighlight(nodes: Node[], edges: Edge[]) {
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  const handleNodeClick = useCallback((_event: MouseEvent, node: Node) => {
    if (node.type === 'ghost' || node.type === 'start') return;
    setHighlightedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setHighlightedNodeId(null);
  }, []);

  const { displayNodes, displayEdges } = useMemo(() => {
    if (!highlightedNodeId) {
      return { displayNodes: nodes, displayEdges: edges };
    }

    const node = nodes.find((n) => n.id === highlightedNodeId);
    if (!node) {
      return { displayNodes: nodes, displayEdges: edges };
    }

    const connectedEdges = getConnectedEdges([node], edges);
    const connectedEdgeIds = new Set(connectedEdges.map((e) => e.id));

    const incomers = getIncomers(node, nodes, edges);
    const outgoers = getOutgoers(node, nodes, edges);
    const connectedNodeIds = new Set([highlightedNodeId, ...incomers.map((n) => n.id), ...outgoers.map((n) => n.id)]);

    const displayNodes = nodes.map((n) => {
      const base = stripClasses(n.className ?? '', 'node-highlighted', 'node-highlighted--source', 'node-dimmed');
      const isSource = n.id === highlightedNodeId;
      const isConnected = connectedNodeIds.has(n.id);
      let extra = 'node-dimmed';
      if (isSource) extra = 'node-highlighted node-highlighted--source';
      else if (isConnected) extra = 'node-highlighted';
      return { ...n, className: `${base} ${extra}`.trim() };
    });

    const displayEdges = edges.map((e) => {
      const isHighlighted = connectedEdgeIds.has(e.id);
      const base = stripClasses(e.className ?? '', 'edge-highlighted', 'edge-dimmed');
      return {
        ...e,
        className: `${base} ${isHighlighted ? 'edge-highlighted' : 'edge-dimmed'}`.trim(),
        data: { ...(e.data as object | undefined), isHighlighted, isDimmed: !isHighlighted },
      };
    });

    return { displayNodes, displayEdges };
  }, [highlightedNodeId, nodes, edges]);

  return { displayNodes, displayEdges, handleNodeClick, handlePaneClick, highlightedNodeId };
}
