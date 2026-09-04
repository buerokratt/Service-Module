import { Connection, Edge, getIncomers, getOutgoers, Node } from '@xyflow/react';
import { StepType } from 'types';
import { MultiChoiceQuestionButton } from 'types/multi-choice-question';

export const MCQ_SOURCE_HANDLE_ID = 'mcq-out';

export type McqEmptyBranch = {
  readonly edgeId: string;
  readonly label: string;
  readonly ghostNodeId: string;
  readonly handleIndex: number;
};

export const getMcqButtons = (mcqNode: Node): MultiChoiceQuestionButton[] =>
  mcqNode.data?.multiChoiceQuestion?.buttons ?? [];

export const getEmptyMcqBranches = (mcqNodeId: string, nodes: Node[], edges: Edge[]): McqEmptyBranch[] => {
  const mcqNode = nodes.find((n) => n.id === mcqNodeId);
  if (!mcqNode || mcqNode.data?.stepType !== StepType.MultiChoiceQuestion) return [];

  const buttons = getMcqButtons(mcqNode);
  const outgoing = edges.filter((e) => e.source === mcqNodeId);

  return buttons.flatMap((button, handleIndex) => {
    const edge = outgoing.find((e) => e.label === button.title);
    if (!edge) return [];

    const target = nodes.find((n) => n.id === edge.target);
    if (target?.type !== 'ghost') return [];

    return [
      {
        edgeId: edge.id,
        label: button.title,
        ghostNodeId: edge.target,
        handleIndex,
      },
    ];
  });
};

export const mcqHasEmptyBranches = (mcqNodeId: string, nodes: Node[], edges: Edge[]): boolean =>
  getEmptyMcqBranches(mcqNodeId, nodes, edges).length > 0;

export const applyMcqBranchConnection = ({
  nodes,
  edges,
  mcqId,
  targetId,
  branch,
}: {
  nodes: Node[];
  edges: Edge[];
  mcqId: string;
  targetId: string;
  branch: McqEmptyBranch;
}): { nodes: Node[]; edges: Edge[] } => {
  let finalNodes = nodes.filter((n) => n.id !== branch.ghostNodeId);
  let finalEdges = edges.filter((e) => e.id !== branch.edgeId);

  finalEdges = [
    ...finalEdges,
    {
      id: `${mcqId}->${targetId}`,
      source: mcqId,
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

export const applySimpleConnection = ({
  nodes,
  edges,
  connection,
}: {
  nodes: Node[];
  edges: Edge[];
  connection: Connection;
}): { nodes: Node[]; edges: Edge[] } => {
  const { source, target } = connection;
  if (!source || !target) return { nodes, edges };

  const parentOutgoingEdges = edges.filter((edge) => edge.source === source);
  const ghostEdges = parentOutgoingEdges.filter((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target);
    return targetNode?.type === 'ghost';
  });

  let finalNodes = nodes;
  let finalEdges = edges;

  let preservedLabel: string | undefined;
  if (ghostEdges.length > 0) {
    const ghostNodeIds = new Set(ghostEdges.map((edge) => edge.target));
    finalEdges = edges.filter((edge) => !ghostEdges.includes(edge));
    finalNodes = nodes.filter((node) => !ghostNodeIds.has(node.id));
    if (ghostEdges.length === 1) {
      const label = ghostEdges[0].label;
      if (typeof label === 'string' && label !== '+') preservedLabel = label;
    }
  }

  finalEdges = [
    ...finalEdges,
    {
      id: `${source}->${target}`,
      source,
      target,
      type: 'step',
      ...(preservedLabel === undefined ? {} : { label: preservedLabel }),
    },
  ];

  return { nodes: finalNodes, edges: finalEdges };
};
