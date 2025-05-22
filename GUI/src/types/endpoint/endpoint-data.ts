import { Endpoint } from "./endpoint";
import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  name: string;
  fileName?: string;
  type?: EndpointType;
  isCommon?: boolean;
  openApiUrl?: string;
  testEnvUrl?: string;
  hasTestEnv?: boolean;
  serviceId?: string;
  definitions: Endpoint[];
};
