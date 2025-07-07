import { Node, Edge, getIncomers, getOutgoers, getConnectedEdges, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
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
  
const processDeletedNodes = (
  edges: Edge[],
  deletedNodes: Node[],
  nodes: Node[],
  setNodes: (nodes: Node[]) => void
): Edge[] => {

  let updatedNodes = [...nodes];
  let updatedEdges = [...edges];

  for (const node of deletedNodes) {
    const incomers = getIncomers(node, updatedNodes, updatedEdges);
    let outgoers = getOutgoers(node, updatedNodes, updatedEdges);

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
      updatedNodes = [...updatedNodes.filter((n) => n.id !== node.id), ghostNode];
    } else {
      updatedNodes = updatedNodes.filter((n) => n.id !== node.id);
    }

    const newEdges = createNewEdges(incomers, outgoers, updatedNodes);
    updatedEdges = [...getRemainingEdges(updatedEdges, getConnectedEdges([node], updatedEdges)), ...newEdges];
  }

  setNodes(updatedNodes);
  return updatedEdges;
};

  function getDirectlyConnectedNodes(nodeId: string, nodes: Node[], edges: Edge[], withGhost: boolean = true): Node[] {
    const connectedNodeIds = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
    return nodes.filter((node) => connectedNodeIds.includes(node.id) && (withGhost || node.type !== "ghost"));
  }

  export const useOnNodesDelete = () => {
    const { getNodes, getEdges, setEdges, setNodes } = useReactFlow();

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);

    const hasConnectedNodes = useCallback(
      (nodeId: string) => {
        const nodes = getNodes();
        const edges = getEdges();
        return getDirectlyConnectedNodes(nodeId, nodes, edges, false).length > 0;
      },
      [getNodes, getEdges]
    );

    const setDeletedNodes = useCallback((nodes: Node[] | null) => setNodeToDelete(nodes?.[0] ?? null), []);

    const onDeleteConfirmed = useCallback(async () => {
      if (!nodeToDelete) return;

      const nodes = getNodes();
      const edges = getEdges();
      const connectedNodes = getDirectlyConnectedNodes(nodeToDelete.id, nodes, edges, false);
      const nodesToDelete = [nodeToDelete, ...connectedNodes];

      setEdges(processDeletedNodes(getEdges(), nodesToDelete, getNodes(), setNodes));

      setIsDeleteModalVisible(false);
      setNodeToDelete(null);
    }, [nodeToDelete, getNodes, getEdges, setEdges, setNodes]);
    

    const onKeepItConfirmed = useCallback(() => {
      if (!nodeToDelete) return;
      setEdges(processDeletedNodes(getEdges(), [nodeToDelete], getNodes(), setNodes));
      setIsDeleteModalVisible(false);
      setNodeToDelete(null);
    }, [nodeToDelete, getNodes, getEdges, setEdges, setNodes]);

    return {
      onNodesDelete: useCallback(
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
              if (hasConnectedNodes(deleted[0].id)) {
                setNodeToDelete(deleted[0]);
                setIsDeleteModalVisible(true);
                return;
              }
            }
          } catch (error) {
            console.error(error);
          }

          setEdges(deleted.reduce((acc: Edge[], node: Node) => processDeletedNodes(acc, [node], nodes, setNodes), edges));
        },
        [getNodes, getEdges, setEdges, setNodes, hasConnectedNodes]
      ),
      isDeleteModalVisible,
      setIsDeleteModalVisible,
      onDeleteConfirmed,
      onKeepItConfirmed,
      hasConnectedNodes,
      setDeletedNodes,
    };
  };
