import { Node } from '@xyflow/react';
import { ServiceState } from 'types';
import { StepType } from 'types';
import { describe, expect, it, vi } from 'vitest';

import { findActivationBlockers, ServiceFlowLookup } from './service-activation';

const jumpNode = (id: string, serviceId?: string, serviceName = 'Target'): Node => ({
  id,
  type: 'custom',
  position: { x: 0, y: 0 },
  data: { stepType: StepType.JumpToService, jumpToService: { serviceId, serviceName, input: [] } },
});

describe('findActivationBlockers', () => {
  it('returns no blockers when the flow has no jump-to-service nodes', async () => {
    const fetchService = vi.fn();
    const result = await findActivationBlockers([], fetchService);

    expect(result).toEqual([]);
    expect(fetchService).not.toHaveBeenCalled();
  });

  it('returns no blockers when every directly referenced target is active', async () => {
    const nodes = [jumpNode('jump-1', 'service-a')];
    const fetchService = vi.fn(() =>
      Promise.resolve<ServiceFlowLookup>({ name: 'Service A', state: ServiceState.Active, nodes: [] }),
    );

    const result = await findActivationBlockers(nodes, fetchService);

    expect(result).toEqual([]);
  });

  it('flags a directly referenced target that is not active', async () => {
    const nodes = [jumpNode('jump-1', 'service-a')];
    const fetchService = vi.fn(() =>
      Promise.resolve<ServiceFlowLookup>({ name: 'Service A', state: ServiceState.Ready, nodes: [] }),
    );

    const result = await findActivationBlockers(nodes, fetchService);

    expect(result).toEqual([{ serviceId: 'service-a', name: 'Service A', state: ServiceState.Ready }]);
  });

  it('flags a missing target using its last known name', async () => {
    const nodes = [jumpNode('jump-1', 'deleted-service', 'Deleted Service')];
    const fetchService = vi.fn(() => Promise.resolve(undefined));

    const result = await findActivationBlockers(nodes, fetchService);

    expect(result).toEqual([{ serviceId: 'deleted-service', name: 'Deleted Service', state: 'missing' }]);
  });

  it('recurses into indirectly referenced services', async () => {
    const nodes = [jumpNode('jump-1', 'service-a')];
    const fetchService = vi.fn((id: string): Promise<ServiceFlowLookup | undefined> => {
      if (id === 'service-a') {
        return Promise.resolve({
          name: 'Service A',
          state: ServiceState.Active,
          nodes: [jumpNode('jump-2', 'service-b')],
        });
      }
      if (id === 'service-b') {
        return Promise.resolve({ name: 'Service B', state: ServiceState.Draft, nodes: [] });
      }
      return Promise.resolve(undefined);
    });

    const result = await findActivationBlockers(nodes, fetchService);

    expect(result).toEqual([{ serviceId: 'service-b', name: 'Service B', state: ServiceState.Draft }]);
  });

  it('does not revisit a service already seen, guarding against cycles', async () => {
    const nodes = [jumpNode('jump-1', 'service-a')];
    const fetchService = vi.fn((id: string): Promise<ServiceFlowLookup | undefined> => {
      if (id === 'service-a') {
        return Promise.resolve({
          name: 'Service A',
          state: ServiceState.Ready,
          nodes: [jumpNode('jump-2', 'service-b')],
        });
      }
      if (id === 'service-b') {
        return Promise.resolve({
          name: 'Service B',
          state: ServiceState.Ready,
          nodes: [jumpNode('jump-3', 'service-a')],
        });
      }
      return Promise.resolve(undefined);
    });

    const result = await findActivationBlockers(nodes, fetchService);

    expect(fetchService).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { serviceId: 'service-a', name: 'Service A', state: ServiceState.Ready },
      { serviceId: 'service-b', name: 'Service B', state: ServiceState.Ready },
    ]);
  });

  it('ignores jump-to-service nodes with no selected target', async () => {
    const nodes = [jumpNode('jump-1')];
    const fetchService = vi.fn();

    const result = await findActivationBlockers(nodes, fetchService);

    expect(result).toEqual([]);
    expect(fetchService).not.toHaveBeenCalled();
  });
});
