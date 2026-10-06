import { Edge, Node } from '@xyflow/react';
import { StepType } from 'types';
import { JumpToService } from 'types/jump-to-service';

export interface FlowCompletenessResult {
  readonly isComplete: boolean;
  readonly unconnectedNodeIds: ReadonlySet<string>;
  readonly unfinishedEdgeIds: ReadonlySet<string>;
  readonly unresolvedJumpToServiceNodeIds: ReadonlySet<string>;
}

const getReachableNodeIds = (nodes: Node[], edges: Edge[]): Set<string> => {
  const startNode = nodes.find((node) => node.type === 'start');
  const reachableNodeIds = new Set<string>();
  if (!startNode) return reachableNodeIds;

  const queue = [startNode.id];
  while (queue.length > 0) {
    const currentId = queue.shift() as string;
    if (reachableNodeIds.has(currentId)) continue;
    reachableNodeIds.add(currentId);
    edges.forEach((edge) => {
      if (edge.source === currentId) queue.push(edge.target);
    });
  }

  return reachableNodeIds;
};

export const validateFlowCompleteness = (
  nodes: Node[],
  edges: Edge[],
  navigableServices: Map<string, string>,
): FlowCompletenessResult => {
  const reachableNodeIds = getReachableNodeIds(nodes, edges);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const unconnectedNodeIds = new Set(
    nodes.filter((node) => node.type === 'custom' && !reachableNodeIds.has(node.id)).map((node) => node.id),
  );

  const unfinishedEdgeIds = new Set(
    edges.filter((edge) => nodesById.get(edge.target)?.type === 'ghost').map((edge) => edge.id),
  );

  const unresolvedJumpToServiceNodeIds = new Set(
    nodes
      .filter((node) => node.type === 'custom' && node.data?.stepType === StepType.JumpToService)
      .filter((node) => {
        const jumpToService = node.data?.jumpToService as JumpToService | undefined;
        const serviceId = jumpToService?.serviceId;
        return !serviceId || !navigableServices.has(serviceId);
      })
      .map((node) => node.id),
  );

  return {
    isComplete:
      unconnectedNodeIds.size === 0 && unfinishedEdgeIds.size === 0 && unresolvedJumpToServiceNodeIds.size === 0,
    unconnectedNodeIds,
    unfinishedEdgeIds,
    unresolvedJumpToServiceNodeIds,
  };
};
