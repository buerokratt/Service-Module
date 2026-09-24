import { Node } from '@xyflow/react';
import { ActivationBlocker } from 'types/activation-blocker';
import { JumpToService } from 'types/jump-to-service';
import { ServiceState } from 'types/service-state';
import { StepType } from 'types/step-type.enum';

export interface ServiceFlowLookup {
  readonly name: string;
  readonly state: ServiceState;
  readonly nodes: Node[];
}

export type FetchServiceFlow = (serviceId: string) => Promise<ServiceFlowLookup | undefined>;

const getJumpToServiceTargets = (nodes: Node[]): JumpToService[] =>
  nodes
    .filter((node) => node.type === 'custom' && node.data?.stepType === StepType.JumpToService)
    .map((node) => node.data?.jumpToService as JumpToService | undefined)
    .filter((jumpToService): jumpToService is JumpToService => !!jumpToService?.serviceId);

export const findActivationBlockers = async (
  rootNodes: Node[],
  fetchService: FetchServiceFlow,
): Promise<ActivationBlocker[]> => {
  const visited = new Set<string>();
  const blockers = new Map<string, ActivationBlocker>();
  let queue = getJumpToServiceTargets(rootNodes);

  while (queue.length > 0) {
    const nextQueue: JumpToService[] = [];

    for (const jumpToService of queue) {
      const targetId = jumpToService.serviceId as string;
      if (visited.has(targetId)) continue;
      visited.add(targetId);

      const target = await fetchService(targetId);

      if (!target) {
        blockers.set(targetId, { serviceId: targetId, name: jumpToService.serviceName || targetId, state: 'missing' });
        continue;
      }

      if (target.state !== ServiceState.Active) {
        blockers.set(targetId, { serviceId: targetId, name: target.name, state: target.state });
      }

      nextQueue.push(...getJumpToServiceTargets(target.nodes));
    }

    queue = nextQueue;
  }

  return Array.from(blockers.values());
};
