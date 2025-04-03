import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  name: string;
  fileName?: string;
  type?: string;
  isCommon?: boolean;
  openApiUrl?: string;
  testEnvUrl?: string;
  hasTestEnv?: boolean;
  serviceId?: string;
  definedEndpoints: EndpointType[];
};
