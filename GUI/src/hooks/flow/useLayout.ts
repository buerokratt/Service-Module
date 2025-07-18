import { useCallback, useEffect, useRef } from "react";
import { useReactFlow, useStore, Node, Edge, ReactFlowState } from "@xyflow/react";
import { stratify, tree } from "d3-hierarchy";
import { timer } from "d3-timer";

const layout = tree<Node>()
  .nodeSize([400, 180])
  .separation(() => 1);

const options = { duration: 300 };

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) {
    return [];
  }

  const nodesCopy = [...nodes];
  const edgesCopy = [...edges];

  const rootNodes = nodesCopy.filter((node) => !edgesCopy.some((edge) => edge.target === node.id));

  if (rootNodes.length > 1) {
    const virtualRootId = "virtual-root";

    nodesCopy.push({
      id: virtualRootId,
      type: "virtual",
      data: {},
      position: { x: 0, y: 0 },
    });

    rootNodes.forEach((root) => {
      edgesCopy.push({
        id: `virtual-edge-${root.id}`,
        source: virtualRootId,
        target: root.id,
      });
    });
  }

  try {
    const hierarchy = stratify<Node>()
      .id((d) => d.id)
      .parentId((d: Node) => edgesCopy.find((e: Edge) => e.target === d.id)?.source)(nodesCopy);

    const root = layout(hierarchy);

    return root
      .descendants()
      .map((d) => ({ ...d.data, position: { x: d.x, y: d.y } }))
      .filter((node) => node.id !== "virtual-root");
  } catch (error) {
    console.error("Error in hierarchy layout:", error);
    return nodes;
  }
}

const nodeCountSelector = (state: ReactFlowState) => state.nodeLookup.size;
const edgeCountSelector = (state: ReactFlowState) => state.edgeLookup.size;

function useLayout() {
  const initial = useRef(true);

  const nodeCount = useStore(nodeCountSelector);
  const edgeCount = useStore(edgeCountSelector);
  const { getNodes, getNode, setNodes, setEdges, getEdges, fitView } = useReactFlow();

  const runLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    const targetNodes = layoutNodes(nodes, edges);
    const transitions = targetNodes.map((node) => {
      return {
        id: node.id,
        from: getNode(node.id)?.position ?? node.position,
        to: node.type === "starts" ? { x: 140, y: 0 } : node.position,
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
  }, [getEdges, getNodes, getNode, setNodes, fitView, setEdges ]);

  useEffect(() => {
    runLayout();
  }, [nodeCount, edgeCount, runLayout]);
  
  return { runLayout };
}

export default useLayout;
