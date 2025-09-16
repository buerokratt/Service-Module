import { Edge, Node, ReactFlowState, useReactFlow, useStore } from '@xyflow/react';
import { stratify, tree } from 'd3-hierarchy';
import { timer } from 'd3-timer';
import { useCallback, useEffect, useRef } from 'react';
import { StepType } from 'types';

const options = { duration: 300 };

function layoutNodes(nodes: Node[], edges: Edge[], orientation: 'horizontal' | 'vertical' = 'horizontal'): Node[] {
  if (nodes.length === 0) {
    return [];
  }

  const layout = tree<Node>().nodeSize(orientation === 'vertical' ? [400, 180] : [400, 500]).separation(() => 1);

  const nodesCopy = [...nodes];
  const edgesCopy = [...edges];
  const previousPositions = new Map(nodes.map((n) => [n.id, n.position]));

  const multiParentNodes = nodesCopy.filter((node) => edgesCopy.filter((edge) => edge.target === node.id).length > 1);
  const nodesToExclude = new Set(multiParentNodes.map((n) => n.id));
  const filteredNodes = nodesCopy.filter((n) => !nodesToExclude.has(n.id));
  const filteredEdges = edgesCopy.filter((e) => !nodesToExclude.has(e.target));

  const rootNodes = filteredNodes.filter((node) => !filteredEdges.some((edge) => edge.target === node.id));

  if (rootNodes.length > 1) {
    const virtualRootId = 'virtual-root';

    filteredNodes.push({
      id: virtualRootId,
      type: 'virtual',
      data: {},
      position: { x: 0, y: 0 },
    });

    rootNodes.forEach((root) => {
      filteredEdges.push({
        id: `virtual-edge-${root.id}`,
        source: virtualRootId,
        target: root.id,
      });
    });
  }

  try {
    const hierarchy = stratify<Node>()
      .id((d) => d.id)
      .parentId((d: Node) => filteredEdges.find((e: Edge) => e.target === d.id)?.source)(filteredNodes);

    hierarchy.sort((a, b) => {
      if (typeof a.id !== 'string' || typeof b.id !== 'string') return 0;
      const aPos = previousPositions.get(a.id);
      const bPos = previousPositions.get(b.id);
      if (!aPos || !bPos) return 0;
      return aPos.x - bPos.x || aPos.y - bPos.y;
    });

    const root = layout(hierarchy);

    let resultNodes = root
      .descendants()
      .map((d) => ({ ...d.data, position: orientation === 'vertical' ? { x: d.x, y: d.y } : { x: d.y, y: d.x } }))
      .filter((node) => node.id !== 'virtual-root');

    for (const node of multiParentNodes) {
      const parentEdges = edgesCopy.filter((e) => e.target === node.id);
      const parentNodes = resultNodes.filter((n) => parentEdges.some((e) => e.source === n.id));
      const isParentNodesContainMultiPathNode = parentNodes.some(
        (n) => n.data.stepType === StepType.MultiChoiceQuestion || n.data.stepType === StepType.Condition,
      );

      if (parentNodes.length > 0) {
        const avgX = parentNodes.reduce((sum, parent) => sum + parent.position.x, 0) / parentNodes.length;
        const maxParentY = Math.max(...parentNodes.map((p) => p.position.y));
        const newY = maxParentY + 180;
        const multipathNewY = maxParentY + 300;

        resultNodes.push({
          ...node,
          position: {
            x: avgX,
            y: isParentNodesContainMultiPathNode ? multipathNewY : newY,
          },
        });
      } else {
        resultNodes.push(node);
      }
    }

    return resultNodes;
  } catch (error) {
    console.error('Error in hierarchy layout:', error);
    return nodes;
  }
}

const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size;
const edgeCountSelector = (state: ReactFlowState) => state.edgeLookup.size;

function useLayout(orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const initial = useRef(true);

  const nodeCount = useStore(nodeCountSelector);
  const edgeCount = useStore(edgeCountSelector);
  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } = useReactFlow();

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

    const t = timer((elapsed: number) => {
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

        if (!initial.current) {
          fitView({ duration: 200, padding: 3 });
        }
        initial.current = false;
      }
    });

    return () => {
      t.stop();
    };
  }, [getEdges, getNodes, getNode, setNodes, fitView, setEdges, orientation]);

  useEffect(() => {
    runLayout();
  }, [nodeCount, edgeCount, runLayout]);

  return { runLayout };
}

export default useLayout;
