import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  type?: string;
  url?: string;
  testEnvUrl?: string;
  definedEndpoints: EndpointType[];
};
