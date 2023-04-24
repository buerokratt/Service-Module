import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  name: string;
  type?: string;
  url?: string;
  testEnvUrl?: string;
  definedEndpoints: EndpointType[];
};
