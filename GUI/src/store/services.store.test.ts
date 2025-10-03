import { ServiceState } from 'types';
import { describe, expect, it } from 'vitest';

import { mapServicesWithLinkedIntent, ServicesListResponse } from './services.store';
import { Intent } from '../types/Intent';
import { Trigger } from '../types/Trigger';

describe('mapServicesWithLinkedIntent', () => {
  it('should map services with linked intent information', () => {
    const mockServices = [
      {
        id: 1,
        name: 'Test Service 1',
        description: 'Test Description 1',
        slot: 'test-slot-1',
        state: ServiceState.Active,
        type: 'GET' as const,
        serviceId: 'service-1',
        totalPages: 1,
        iscommon: false,
      },
      {
        id: 2,
        name: 'Test Service 2',
        description: 'Test Description 2',
        slot: 'test-slot-2',
        state: ServiceState.Active,
        type: 'GET' as const,
        serviceId: 'service-2',
        totalPages: 1,
        iscommon: true,
      },
    ];

    const mockTriggers = [
      {
        intent: 'test-intent-1',
        service: 'service-1',
        created: '2023-01-01T00:00:00Z',
      },
      {
        intent: 'test-intent-2',
        service: 'service-2',
        created: '2023-01-02T00:00:00Z',
      },
    ];

    const mockIntents = [
      {
        intent: 'test-intent-1',
        status: 'ACTIVE',
      },
      {
        intent: 'test-intent-2',
        status: 'PENDING',
      },
    ];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Test Service 1',
      description: 'Test Description 1',
      slot: 'test-slot-1',
      state: ServiceState.Active,
      type: 'GET',
      isCommon: false,
      serviceId: 'service-1',
      usedCount: 0,
      totalPages: 1,
      linkedIntent: {
        name: 'test-intent-1',
        status: 'ACTIVE',
      },
      endpoints: [],
    });

    expect(result[1]).toEqual({
      id: 2,
      name: 'Test Service 2',
      description: 'Test Description 2',
      slot: 'test-slot-2',
      state: ServiceState.Active,
      type: 'GET',
      isCommon: true,
      serviceId: 'service-2',
      usedCount: 0,
      totalPages: 1,
      linkedIntent: {
        name: 'test-intent-2',
        status: 'PENDING',
      },
      endpoints: [],
    });
  });

  it('should handle services without linked intents', () => {
    const mockServices = [
      {
        id: 1,
        name: 'Test Service 1',
        description: 'Test Description 1',
        slot: 'test-slot-1',
        state: ServiceState.Active,
        type: 'GET' as const,
        serviceId: 'service-1',
        totalPages: 1,
        iscommon: false,
      },
    ];

    const mockTriggers: Trigger[] = [];
    const mockIntents: Intent[] = [];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result).toHaveLength(1);
    expect(result[0].linkedIntent).toEqual({
      name: '',
      status: '',
    });
  });

  it('should handle services with triggers but no matching intent status', () => {
    const mockServices = [
      {
        id: 1,
        name: 'Test Service 1',
        description: 'Test Description 1',
        slot: 'test-slot-1',
        state: ServiceState.Active,
        type: 'GET' as const,
        serviceId: 'service-1',
        totalPages: 1,
        iscommon: false,
      },
    ];

    const mockTriggers = [
      {
        intent: 'test-intent-1',
        service: 'service-1',
        created: '2023-01-01T00:00:00Z',
      },
    ];

    const mockIntents = [
      {
        intent: 'different-intent',
        status: 'ACTIVE',
      },
    ];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result).toHaveLength(1);
    expect(result[0].linkedIntent).toEqual({
      name: 'test-intent-1',
      status: '',
    });
  });

  it('should handle empty services array', () => {
    const mockServices: any[] = [];
    const mockTriggers: Trigger[] = [];
    const mockIntents: Intent[] = [];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result).toEqual([]);
  });

  it('should handle null/undefined services array', () => {
    const mockServices = null as any;
    const mockTriggers: Trigger[] = [];
    const mockIntents: Intent[] = [];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result).toEqual([]);
  });

  it('should correctly map iscommon field to isCommon', () => {
    const mockServices = [
      {
        id: 1,
        name: 'Test Service 1',
        description: 'Test Description 1',
        slot: 'test-slot-1',
        state: ServiceState.Active,
        type: 'GET' as const,
        serviceId: 'service-1',
        totalPages: 1,
        iscommon: true,
      },
    ];

    const mockTriggers: Trigger[] = [];
    const mockIntents: Intent[] = [];

    const response: ServicesListResponse = [mockServices, mockTriggers, mockIntents];

    const result = mapServicesWithLinkedIntent(response);

    expect(result[0].isCommon).toBe(true);
  });
});
