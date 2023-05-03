import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  name: string;
  type?: string;
  openApiUrl?: string;
  testEnvUrl?: string;
  definedEndpoints: EndpointType[];
};
