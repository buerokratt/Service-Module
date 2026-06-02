import { Edge, Node, ReactFlowState, useReactFlow, useStore } from '@xyflow/react';
import { stratify, tree } from 'd3-hierarchy';
import { timer } from 'd3-timer';
import { useCallback, useEffect, useRef } from 'react';
import useServiceStore from 'store/services.store';
import { StepType } from 'types';

const options = { duration: 300 };

function getExtraParentEdgeIds(
  multiParentNodes: Node[],
  terminalMultiParentIds: Set<string>,
  edges: Edge[],
): Set<string> {
  const toRemove = new Set<string>();
  for (const node of multiParentNodes) {
    if (terminalMultiParentIds.has(node.id)) continue;
    for (const edge of edges.filter((e) => e.target === node.id).slice(1)) {
      toRemove.add(edge.id);
    }
  }
  return toRemove;
}

function addVirtualRoot(filteredNodes: Node[], filteredEdges: Edge[]): void {
  const rootNodes = filteredNodes.filter((node) => !filteredEdges.some((edge) => edge.target === node.id));
  if (rootNodes.length <= 1) return;
  filteredNodes.push({ id: 'virtual-root', type: 'virtual', data: {}, position: { x: 0, y: 0 } });
  for (const root of rootNodes) {
    filteredEdges.push({ id: `virtual-edge-${root.id}`, source: 'virtual-root', target: root.id });
  }
}

function repositionTerminalNodes(
  resultNodes: Node[],
  multiParentNodes: Node[],
  terminalMultiParentIds: Set<string>,
  edges: Edge[],
): void {
  for (const node of multiParentNodes) {
    if (!terminalMultiParentIds.has(node.id)) continue;
    const parentEdges = edges.filter((e) => e.target === node.id);
    const parentNodes = resultNodes.filter((n) => parentEdges.some((e) => e.source === n.id));
    const isParentMultiPath = parentNodes.some(
      (n) => n.data.stepType === StepType.MultiChoiceQuestion || n.data.stepType === StepType.Condition,
    );
    if (parentNodes.length > 0) {
      const avgX = parentNodes.reduce((sum, p) => sum + p.position.x, 0) / parentNodes.length;
      const maxParentY = Math.max(...parentNodes.map((p) => p.position.y));
      resultNodes.push({ ...node, position: { x: avgX, y: maxParentY + (isParentMultiPath ? 300 : 180) } });
    } else {
      resultNodes.push(node);
    }
  }
}

function layoutNodes(nodes: Node[], edges: Edge[], orientation: 'horizontal' | 'vertical' = 'horizontal'): Node[] {
  if (nodes.length === 0) return [];

  const layout = tree<Node>()
    .nodeSize(orientation === 'vertical' ? [400, 180] : [400, 500])
    .separation(() => 1);

  const nodesCopy = [...nodes];
  const edgesCopy = [...edges];
  const previousPositions = new Map(nodes.map((n) => [n.id, n.position]));

  const multiParentNodes = nodesCopy.filter((node) => edgesCopy.filter((edge) => edge.target === node.id).length > 1);
  const terminalMultiParentIds = new Set(
    multiParentNodes.filter((node) => !edgesCopy.some((e) => e.source === node.id)).map((n) => n.id),
  );
  const extraParentEdgeIds = getExtraParentEdgeIds(multiParentNodes, terminalMultiParentIds, edgesCopy);

  const filteredNodes = nodesCopy.filter((n) => !terminalMultiParentIds.has(n.id));
  const filteredEdges = edgesCopy.filter((e) => !terminalMultiParentIds.has(e.target) && !extraParentEdgeIds.has(e.id));

  addVirtualRoot(filteredNodes, filteredEdges);

  try {
    const hierarchy = stratify<Node>()
      .id((d) => d.id)
      .parentId((d: Node) => filteredEdges.find((e: Edge) => e.target === d.id)?.source)(filteredNodes);

    hierarchy.sort((a, b) => {
      const aPos = previousPositions.get(a.id as string);
      const bPos = previousPositions.get(b.id as string);
      if (!aPos || !bPos) return 0;
      return aPos.x - bPos.x || aPos.y - bPos.y;
    });

    const root = layout(hierarchy);
    const resultNodes = root
      .descendants()
      .map((d) => ({ ...d.data, position: orientation === 'vertical' ? { x: d.x, y: d.y } : { x: d.y, y: d.x } }))
      .filter((node) => node.id !== 'virtual-root');

    repositionTerminalNodes(resultNodes, multiParentNodes, terminalMultiParentIds, edgesCopy);

    return resultNodes;
  } catch {
    return nodes;
  }
}

const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size;
const edgeCountSelector = (state: ReactFlowState) => state.edgeLookup.size;

function useLayout(orientation: 'horizontal' | 'vertical' = 'vertical') {
  const initial = useRef(true);

  const nodeCount = useStore(nodeCountSelector);
  const edgeCount = useStore(edgeCountSelector);
  const { getNodes, getNode, setNodes, getEdges, fitView } = useReactFlow();
  const autoView = useServiceStore((state) => state.autoView);

  const runLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const targetNodes = layoutNodes(nodes, edges, orientation);
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        from: getNode(node.id)?.position ?? node.position,
        to: node.type === 'start' ? { x: 140, y: 0 } : node.position,
        node,
      };
    });

    const t = timer(async (elapsed: number) => {
      const s = elapsed / options.duration;

      const currNodes = transitions.map(({ node, from, to }) => {
        return {
          ...node,
          position: {
            x: from.x + (to.x - from.x) * s,
            y: from.y + (to.y - from.y) * s,
          },
        };
      });

      setNodes(currNodes);

      if (elapsed > options.duration) {
        const finalNodes = transitions.map(({ node, to }) => {
          return {
            ...node,
            position: {
              x: to.x,
              y: to.y,
            },
          };
        });

        setNodes(finalNodes);

        t.stop();

        if (!initial.current && autoView) {
          await fitView({ duration: 200, padding: 5 });
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [getEdges, getNodes, getNode, setNodes, fitView, orientation, autoView]);

  useEffect(() => {
    runLayout();
  }, [nodeCount, edgeCount, runLayout]);

  return { runLayout };
}

export default useLayout;
