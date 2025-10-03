import { EndpointData } from './endpoint';
import { ServiceState } from './service-state';

export type EndpointDefinitionJson = {
  type: string;
  value: string;
  null: boolean;
};

export interface Service {
  readonly id: number;
  readonly name: string;
  usedCount: number;
  readonly state: ServiceState;
  readonly type: 'GET' | 'POST';
  readonly isCommon: boolean;
  readonly description?: string;
  readonly slot?: string;
  readonly structure?: any;
  readonly endpoints: Array<
    Pick<EndpointData, 'endpointId' | 'name' | 'type' | 'fileName' | 'isCommon'> & {
      // Passing as JSON from Resql because ruuter cannot handle parsing properly
      definitions: EndpointDefinitionJson;
    }
  >;
  readonly serviceId: string;
  readonly linkedIntent: LinkedIntent;
  readonly totalPages: number;
}

interface LinkedIntent {
  name: string;
  status: 'TRAINED' | 'NOT_TRAINED' | 'DELETED';
}
