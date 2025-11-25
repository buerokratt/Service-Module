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
  readonly state: ServiceState;
  readonly type: 'GET' | 'POST';
  readonly isCommon: boolean;
  readonly description?: string;
  readonly slot: string;
  readonly examples: string[];
  readonly entities: string[];
  readonly structure?: { value: string };
  readonly endpoints: Array<
    Pick<EndpointData, 'endpointId' | 'name' | 'type' | 'fileName' | 'isCommon'> & {
      // Passing as JSON from Resql because ruuter cannot handle parsing properly
      definitions: EndpointDefinitionJson;
    }
  >;
  readonly serviceId: string;
  readonly linkedIntent: string;
  readonly totalPages: number;
}
