import { StepType } from 'types/step-type.enum';
import { describe, expect, it } from 'vitest';

import {
  buildServiceDependencyMap,
  DependencyReference,
  hasLoopbackReference,
  RawServiceRecord,
  ServiceDependencyMap,
} from './service-dependencies';

describe('buildServiceDependencyMap', () => {
  const makeStructure = (targets: Array<{ serviceId: string; serviceName: string }>) =>
    JSON.stringify({
      nodes: targets.map((target, index) => ({
        id: `node-${index}`,
        data: {
          stepType: StepType.JumpToService,
          jumpToService: target,
        },
      })),
      edges: [],
    });

  it('builds incoming and outgoing dependency references', () => {
    const services: RawServiceRecord[] = [
      {
        serviceId: 'a',
        name: 'Service A',
        state: 'active',
        isCommon: false,
        structure: { value: makeStructure([{ serviceId: 'b', serviceName: 'Service B' }]) },
      },
      {
        serviceId: 'b',
        name: 'Service B',
        state: 'ready',
        isCommon: true,
        structure: { nodes: [], edges: [] },
      },
    ];

    const map: ServiceDependencyMap = buildServiceDependencyMap(services);

    expect(map.a.outgoing).toEqual([
      expect.objectContaining({ serviceId: 'b', name: 'Service B', status: 'active', isCommon: true }),
    ]);
    expect(map.b.incoming).toEqual([expect.objectContaining({ serviceId: 'a', name: 'Service A', status: 'active' })]);
  });

  it('marks missing targets as deleted', () => {
    const services: RawServiceRecord[] = [
      {
        serviceId: 'a',
        name: 'Service A',
        state: 'active',
        isCommon: false,
        structure: { value: makeStructure([{ serviceId: 'missing-id', serviceName: 'Deleted Service' }]) },
      },
    ];

    const map = buildServiceDependencyMap(services);
    const outgoing = map.a.outgoing[0] as DependencyReference;

    expect(outgoing.status).toBe('deleted');
    expect(outgoing.name).toBe('Deleted Service');
  });

  it('marks self-references as loopback', () => {
    const services: RawServiceRecord[] = [
      {
        serviceId: 'a',
        name: 'Service A',
        state: 'active',
        isCommon: false,
        structure: { value: makeStructure([{ serviceId: 'a', serviceName: 'Service A' }]) },
      },
    ];

    const map = buildServiceDependencyMap(services);
    expect(map.a.outgoing[0]?.isSelfReference).toBe(true);
    expect(hasLoopbackReference(map, 'a')).toBe(true);
  });
});
