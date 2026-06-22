import { Edge, getConnectedEdges, getIncomers, getOutgoers, Node, useReactFlow } from '@xyflow/react';
import { useCallback, useState } from 'react';
import { StepType } from 'types';
import { generateUniqueId } from 'utils/flow-utils';

const getRemainingEdges = (allEdges: Edge[], edgesToRemove: Edge[]): Edge[] =>
  allEdges.filter((edge) => !edgesToRemove.includes(edge));

const isGhostNode = (nodes: Node[], targetId: string): boolean =>
  nodes.some((n) => n.id === targetId && n.type === 'ghost');

const createNewEdges = (incomers: Node[], outgoers: Node[], nodes: Node[], connectedEdges: Edge[]): Edge[] =>
  incomers.flatMap(({ id: source }) =>
    outgoers.map(({ id: target }) => {
      return {
        id: `${source}->${target}`,
        source,
        target,
        type: 'step',
        animated: isGhostNode(nodes, target),
        deletable: !isGhostNode(nodes, target),
        label: connectedEdges.find((edge) => edge.source === source)?.label ?? '+',
      };
    }),
  );

const processDeletedNodes = (
  edges: Edge[],
  deletedNodes: Node[],
  nodes: Node[],
): { updatedNodes: Node[]; updatedEdges: Edge[] } => {
  let updatedNodes = [...nodes];
  let updatedEdges = [...edges];

  for (const node of deletedNodes) {
    const incomers = getIncomers(node, updatedNodes, updatedEdges);
    let outgoers = getOutgoers(node, updatedNodes, updatedEdges);

    const outgoingGhostNodes = outgoers.filter((outgoer) => outgoer.type === 'ghost');
    if (outgoingGhostNodes.length > 0) {
      const ghostEdges = getConnectedEdges(outgoingGhostNodes, updatedEdges);
      updatedEdges = getRemainingEdges(updatedEdges, ghostEdges);
      updatedNodes = updatedNodes.filter((n) => !outgoingGhostNodes.some((ghost) => ghost.id === n.id));
      outgoers = [];
    }

    if (incomers.length > 1) {
      const newGhostNodes: Node[] = [];
      const newEdges: Edge[] = [];

      incomers.forEach((incomer) => {
        const ghostNode: Node = {
          id: generateUniqueId(),
          type: 'ghost',
          position: {
            x: node.position.x,
            y: node.position.y,
          },
          data: { type: 'ghost' },
          className: 'ghost',
          selectable: false,
          draggable: false,
        };

        newGhostNodes.push(ghostNode);
        newEdges.push({
          id: `${incomer.id}->${ghostNode.id}`,
          source: incomer.id,
          target: ghostNode.id,
          type: 'step',
          animated: true,
          deletable: false,
          label: updatedEdges.find((edge) => edge.source === incomer.id && edge.target === node.id)?.label ?? '+',
        });
      });

      updatedNodes = [...updatedNodes.filter((n) => n.id !== node.id), ...newGhostNodes];
      updatedEdges = [...getRemainingEdges(updatedEdges, getConnectedEdges([node], updatedEdges)), ...newEdges];
    } else {
      const edgesWithoutDeleted = getRemainingEdges(updatedEdges, getConnectedEdges([node], updatedEdges));
      if (
        outgoers.length === 0 ||
        outgoers.length > 1 ||
        (outgoers.length === 1 && getIncomers(outgoers[0], updatedNodes, edgesWithoutDeleted).length > 0)
      ) {
        const ghostNode: Node = {
          id: generateUniqueId(),
          type: 'ghost',
          position: { x: node.position.x, y: node.position.y },
          data: { type: 'ghost' },
          className: 'ghost',
          selectable: false,
          draggable: false,
        };
        outgoers = [ghostNode];
        updatedNodes = [...updatedNodes.filter((n) => n.id !== node.id), ghostNode];
      } else {
        updatedNodes = updatedNodes.filter((n) => n.id !== node.id);
      }

      const newEdges = createNewEdges(incomers, outgoers, updatedNodes, getConnectedEdges([node], updatedEdges));
      updatedEdges = [...getRemainingEdges(updatedEdges, getConnectedEdges([node], updatedEdges)), ...newEdges];
    }
  }

  updatedNodes = updatedNodes.filter(
    (node) =>
      node.type !== 'ghost' ||
      getIncomers(node, updatedNodes, updatedEdges).length > 0 ||
      getOutgoers(node, updatedNodes, updatedEdges).length > 0,
  );

  return { updatedNodes, updatedEdges };
};

function getDirectlyConnectedNodes(nodeId: string, nodes: Node[], edges: Edge[], withGhost: boolean = true): Node[] {
  const connectedNodeIds = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
  return nodes.filter((node) => connectedNodeIds.includes(node.id) && (withGhost || node.type !== 'ghost'));
}

export const useOnNodesDelete = () => {
  const { getNodes, getEdges, setEdges, setNodes, getNode } = useReactFlow();

  const [isDeleteConnectionsModalVisible, setIsDeleteConnectionsModalVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);

  const hasConnectedNodes = useCallback(
    (nodeId: string) => {
      const nodes = getNodes();
      const edges = getEdges();
      return getDirectlyConnectedNodes(nodeId, nodes, edges, false).length > 0;
    },
    [getNodes, getEdges],
  );

  const setDeletedNodes = useCallback((nodes: Node[] | null) => setNodeToDelete(nodes?.[0] ?? null), []);

  const onDeleteConfirmed = useCallback(() => {
    if (!nodeToDelete) return;

    const nodes = getNodes();
    const edges = getEdges();

    const getAllDescendants = (nodeId: string, edges: Edge[], visited = new Set<string>()): string[] => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);

      const descendants: string[] = [];
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          descendants.push(edge.target);
          descendants.push(...getAllDescendants(edge.target, edges, visited));
        }
      });

      return descendants;
    };

    const descendantIds = getAllDescendants(nodeToDelete.id, edges);
    const uniqueDescendantIds = Array.from(new Set(descendantIds));
    const descendantNodes = nodes.filter((node) => uniqueDescendantIds.includes(node.id));
    const nodesToDelete = [nodeToDelete, ...descendantNodes];

    const { updatedNodes, updatedEdges } = processDeletedNodes(getEdges(), nodesToDelete, getNodes());
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setIsDeleteConnectionsModalVisible(false);
    setNodeToDelete(null);
  }, [nodeToDelete, getNodes, getEdges, setEdges, setNodes]);

  const onKeepItConfirmed = useCallback(() => {
    if (!nodeToDelete) return;
    const { updatedNodes, updatedEdges } = processDeletedNodes(getEdges(), [nodeToDelete], getNodes());
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setIsDeleteConnectionsModalVisible(false);
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
              setIsDeleteConnectionsModalVisible(true);
              return;
            }
          }
        } catch (error) {
          console.error(error);
        }

        const { updatedNodes, updatedEdges } = deleted.reduce(
          (acc: { updatedNodes: Node[]; updatedEdges: Edge[] }, node: Node) => {
            const result = processDeletedNodes(acc.updatedEdges, [node], acc.updatedNodes);
            return {
              updatedNodes: result.updatedNodes,
              updatedEdges: result.updatedEdges,
            };
          },
          { updatedNodes: nodes, updatedEdges: edges },
        );
        setNodes(updatedNodes);
        setEdges(updatedEdges);
      },
      [getNodes, getEdges, setEdges, setNodes, hasConnectedNodes],
    ),
    onEdgesDelete: useCallback(
      (deleted: Edge[]) => {
        const parentNode = getNode(deleted[0].source);
        if (parentNode) {
          const ghostNode: Node = {
            id: generateUniqueId(),
            type: 'ghost',
            position: { x: parentNode.position.x + 50, y: parentNode.position.y + 50 },
            data: { type: 'ghost' },
            className: 'ghost',
            selectable: false,
            draggable: false,
          };

          const ghostEdge: Edge = {
            id: `${parentNode.id}->${ghostNode.id}`,
            source: parentNode.id,
            target: ghostNode.id,
            type: 'step',
            animated: true,
            deletable: false,
            label: deleted[0].label ?? '+',
          };

          setNodes((nds) => [...nds, ghostNode]);
          setEdges((eds) => [...eds, ghostEdge]);
        }
      },
      [getNode, setNodes, setEdges],
    ),
    isDeleteConnectionsModalVisible,
    setIsDeleteConnectionsModalVisible,
    onDeleteConfirmed,
    onKeepItConfirmed,
    hasConnectedNodes,
    setDeletedNodes,
    setNodeToDelete,
  };
};
