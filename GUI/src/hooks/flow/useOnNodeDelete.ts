import { Node, Edge, getIncomers, getOutgoers, getConnectedEdges, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

const getRemainingEdges = (allEdges: Edge[], edgesToRemove: Edge[]): Edge[] =>
  allEdges.filter((edge) => !edgesToRemove.includes(edge));

const isGhostNode = (nodes: Node[], targetId: string): boolean =>
  nodes.some((n) => n.id === targetId && n.type === "ghost");

const createNewEdges = (incomers: Node[], outgoers: Node[], nodes: Node[]): Edge[] =>
  incomers.flatMap(({ id: source }) =>
    outgoers.map(({ id: target }) => ({
      id: `${source}->${target}`,
      source,
      target,
      type: "step",
      animated: isGhostNode(nodes, target),
    }))
  );

const processDeletedNode = (edges: Edge[], node: Node, nodes: Node[], setNodes: (nodes: Node[]) => void): Edge[] => {
  const incomers = getIncomers(node, nodes, edges);
  let outgoers = getOutgoers(node, nodes, edges);
  const connectedEdges = getConnectedEdges([node], edges);

  let updatedNodes = [...nodes];

  if (outgoers.length === 0) {
    const ghostNode: Node = {
      id: crypto.randomUUID(),
      type: "ghost",
      position: { x: node.position.x, y: node.position.y + 150 },
      data: { type: "ghost" },
      className: "ghost",
      selectable: false,
      draggable: false,
    };
    outgoers = [ghostNode];
    updatedNodes = [...nodes, ghostNode];
    setNodes(updatedNodes);
  }

  return [...getRemainingEdges(edges, connectedEdges), ...createNewEdges(incomers, outgoers, updatedNodes)];
};

export const useOnNodesDelete = () => {
  const { getNodes, getEdges, setEdges, setNodes } = useReactFlow();

  return useCallback(
    (deleted: Node[]) => {
      const nodes = getNodes();
      const edges = getEdges();

      setEdges(deleted.reduce((acc: Edge[], node: Node) => processDeletedNode(acc, node, nodes, setNodes), edges));
    },
    [getNodes, getEdges, setEdges, setNodes]
  );
};
