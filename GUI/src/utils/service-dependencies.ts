import { FlowData, NodeDataProps } from 'types/service-flow';
import { StepType } from 'types/step-type.enum';

export type DependencyNodeStatus = 'active' | 'deleted';

export interface DependencyReference {
  readonly serviceId: string;
  readonly name: string;
  readonly state?: string;
  readonly isCommon?: boolean;
  readonly status: DependencyNodeStatus;
  readonly isSelfReference?: boolean;
}

export interface ServiceDependencyInfo {
  readonly incoming: DependencyReference[];
  readonly outgoing: DependencyReference[];
}

export type ServiceDependencyMap = Record<string, ServiceDependencyInfo>;

export type RawServiceRecord = {
  readonly serviceId: string;
  readonly name: string;
  readonly state: string;
  readonly isCommon: boolean;
  readonly structure?: { value?: string } | FlowData;
};

const parseStructure = (structure: RawServiceRecord['structure']): FlowData => {
  if (!structure) return { nodes: [], edges: [] };
  if (typeof structure === 'object' && 'nodes' in structure) {
    return structure as FlowData;
  }
  try {
    const raw = typeof structure === 'object' && 'value' in structure ? structure.value : structure;
    return JSON.parse(typeof raw === 'string' ? raw : '{}') as FlowData;
  } catch {
    return { nodes: [], edges: [] };
  }
};

const extractOutgoingTargets = (
  structure: RawServiceRecord['structure'],
): Array<{ serviceId: string; name: string }> => {
  const flow = parseStructure(structure);
  const targets: Array<{ serviceId: string; name: string }> = [];
  const seen = new Set<string>();

  for (const node of flow.nodes ?? []) {
    const data = node.data as NodeDataProps | undefined;
    if (data?.stepType !== StepType.JumpToService || !data.jumpToService) continue;

    const serviceId = data.jumpToService.serviceId?.trim();
    const name = data.jumpToService.serviceName?.trim();
    if (!serviceId && !name) continue;

    const key = serviceId ?? name!;
    if (seen.has(key)) continue;
    seen.add(key);

    targets.push({
      serviceId: serviceId ?? name!,
      name: name ?? serviceId!,
    });
  }

  return targets;
};

/**
 * Dependency graph built from jump-to-service (next-service) nodes in flow structures.
 *
 * - outgoing: services THIS service jumps to ("Services used by this service")
 * - incoming: services that jump TO this service ("Services using this service")
 */
export const buildServiceDependencyMap = (services: RawServiceRecord[]): ServiceDependencyMap => {
  const serviceById = new Map(
    services.map((service) => [
      service.serviceId,
      { name: service.name, state: service.state, isCommon: service.isCommon },
    ]),
  );

  const map: ServiceDependencyMap = {};

  for (const service of services) {
    map[service.serviceId] = { incoming: [], outgoing: [] };
  }

  for (const service of services) {
    const outgoingTargets = extractOutgoingTargets(service.structure);

    for (const target of outgoingTargets) {
      const resolved = serviceById.get(target.serviceId);
      const reference: DependencyReference = resolved
        ? {
            serviceId: target.serviceId,
            name: resolved.name,
            state: resolved.state,
            isCommon: resolved.isCommon,
            status: 'active',
            isSelfReference: target.serviceId === service.serviceId,
          }
        : {
            serviceId: target.serviceId,
            name: target.name,
            status: 'deleted',
            isSelfReference: target.serviceId === service.serviceId,
          };

      map[service.serviceId]?.outgoing.push(reference);

      if (resolved) {
        map[target.serviceId]?.incoming.push({
          serviceId: service.serviceId,
          name: service.name,
          state: service.state,
          isCommon: service.isCommon,
          status: 'active',
        });
      }
    }
  }

  return map;
};

export const getDependencyCounts = (
  dependencyMap: ServiceDependencyMap,
  serviceId: string,
): { incoming: number; outgoing: number } => {
  const info = dependencyMap[serviceId];
  return {
    incoming: info?.incoming.length ?? 0,
    outgoing: info?.outgoing.length ?? 0,
  };
};

export const hasLoopbackReference = (dependencyMap: ServiceDependencyMap, serviceId: string): boolean =>
  dependencyMap[serviceId]?.outgoing.some((ref) => ref.isSelfReference) ?? false;
