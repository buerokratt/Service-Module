import { Node, Edge, getIncomers, getOutgoers, getConnectedEdges, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { StepType } from "types";

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
      deletable: !isGhostNode(nodes, target),
    }))
  );

  const processDeletedNode = (edges: Edge[], node: Node, nodes: Node[], setNodes: (nodes: Node[]) => void): Edge[] => {
    const incomers = getIncomers(node, nodes, edges);
    let outgoers = getOutgoers(node, nodes, edges);
    const connectedEdges = getConnectedEdges([node], edges);

    let updatedNodes = [...nodes];
    let updatedEdges = [...edges];

    const outgoingGhostNodes = outgoers.filter((outgoer) => outgoer.type === "ghost");
    if (outgoingGhostNodes.length > 0) {
      const ghostEdges = getConnectedEdges(outgoingGhostNodes, updatedEdges);
      updatedEdges = getRemainingEdges(updatedEdges, ghostEdges);

      updatedNodes = updatedNodes.filter((n) => !outgoingGhostNodes.some((ghost) => ghost.id === n.id));
      outgoers = [];
    }

    if (outgoers.length === 0 || outgoers.length > 1) {
      const ghostNode: Node = {
        id: crypto.randomUUID(),
        type: "ghost",
        position: { x: node.position.x, y: node.position.y },
        data: { type: "ghost" },
        className: "ghost",
        selectable: false,
        draggable: false,
      };
      outgoers = [ghostNode];
      updatedNodes = [...updatedNodes, ghostNode];
      setNodes(updatedNodes);
    }

    return [...getRemainingEdges(updatedEdges, connectedEdges), ...createNewEdges(incomers, outgoers, updatedNodes)];
  };

  function getDirectlyConnectedNodes(nodeId: string, nodes: Node[], edges: Edge[]): Node[] {
    const connectedNodeIds = new Set();
    edges.forEach((edge) => {
      if (edge.source === nodeId) connectedNodeIds.add(edge.target);
    });
    return nodes.filter((node) => connectedNodeIds.has(node.id) && node.type !== "ghost");
  }  

export const useOnNodesDelete = () => {
  const { getNodes, getEdges, setEdges, setNodes } = useReactFlow();

  return useCallback(
    (deleted: Node[]) => {
      const nodes = getNodes();
      const edges = getEdges();

      try {
        const stepType = deleted[0].data.stepType;
        if (
          stepType === StepType.MultiChoiceQuestion ||
          stepType === StepType.Condition ||
          stepType === StepType.Input
        ) {
          const connectedNodes = getDirectlyConnectedNodes(deleted[0].id, nodes, edges);
          if (connectedNodes.length > 0) {
            // TODO: Handle the case where there are connected nodes
            console.log("Connected nodes found:", connectedNodes);
          }
        }
      } catch (error) {
        console.error("Error processing deleted nodes:", error);
      }
      setEdges(deleted.reduce((acc: Edge[], node: Node) => processDeletedNode(acc, node, nodes, setNodes), edges));
    },
    [getNodes, getEdges, setEdges, setNodes]
  );
};
