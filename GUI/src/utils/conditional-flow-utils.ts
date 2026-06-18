import { Connection, Edge, getIncomers, getOutgoers, Node } from '@xyflow/react';
import { StepType } from 'types';
import { McqEmptyBranch } from 'utils/mcq-flow-utils';

export const CONDITION_SOURCE_HANDLE_ID = 'condition-out';
export const CONDITION_LABELS = ['Success', 'Failure'] as const;

export const getConditionNodeIdFromConnection = (
  connection: Connection,
  getNode: (id: string) => Node | undefined,
): string | null => {
  const sourceNode = connection.source ? getNode(connection.source) : undefined;
  const targetNode = connection.target ? getNode(connection.target) : undefined;

  if (sourceNode?.data?.stepType === StepType.Condition) return sourceNode.id;
  if (targetNode?.data?.stepType === StepType.Condition) return targetNode.id;
  return null;
};

export const getEmptyConditionBranches = (conditionNodeId: string, nodes: Node[], edges: Edge[]): McqEmptyBranch[] => {
  const conditionNode = nodes.find((n) => n.id === conditionNodeId);
  if (!conditionNode || conditionNode.data?.stepType !== StepType.Condition) return [];

  const outgoing = edges.filter((e) => e.source === conditionNodeId);

  return CONDITION_LABELS.flatMap((label, handleIndex) => {
    const edge = outgoing.find((e) => e.label === label);
    if (!edge) return [];

    const target = nodes.find((n) => n.id === edge.target);
    if (target?.type !== 'ghost') return [];

    return [{ edgeId: edge.id, label, ghostNodeId: edge.target, handleIndex }];
  });
};

export const conditionHasEmptyBranches = (conditionNodeId: string, nodes: Node[], edges: Edge[]): boolean =>
  getEmptyConditionBranches(conditionNodeId, nodes, edges).length > 0;

export const applyConditionBranchConnection = ({
  nodes,
  edges,
  conditionId,
  targetId,
  branch,
}: {
  nodes: Node[];
  edges: Edge[];
  conditionId: string;
  targetId: string;
  branch: McqEmptyBranch;
}): { nodes: Node[]; edges: Edge[] } => {
  let finalNodes = nodes.filter((n) => n.id !== branch.ghostNodeId);
  let finalEdges = edges.filter((e) => e.id !== branch.edgeId);

  finalEdges = [
    ...finalEdges,
    {
      id: `${conditionId}->${targetId}-${branch.label}`,
      source: conditionId,
      target: targetId,
      type: 'step',
      label: branch.label,
      animated: false,
      deletable: true,
    },
  ];

  finalNodes = finalNodes.filter(
    (node) =>
      node.type !== 'ghost' ||
      getIncomers(node, finalNodes, finalEdges).length > 0 ||
      getOutgoers(node, finalNodes, finalEdges).length > 0,
  );

  return { nodes: finalNodes, edges: finalEdges };
};
