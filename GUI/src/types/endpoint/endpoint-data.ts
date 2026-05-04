import { EndpointDefinition } from './endpoint-definition';
import { EndpointType } from './endpoint-type';

export type EndpointData = {
  endpointId: string;
  name: string;
  fileName?: string;
  type?: EndpointType;
  isNew?: boolean;
  hasTestEnv?: boolean;
  serviceId?: string;
  description?: string;
  definitions: EndpointDefinition[];
};
