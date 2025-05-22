import { Endpoint } from "./endpoint";
import { EndpointType } from "./endpoint-type";

export type EndpointData = {
  id: string;
  name: string;
  fileName?: string;
  type?: EndpointType;
  isCommon?: boolean;
  openApiUrl?: string;
  hasTestEnv?: boolean;
  serviceId?: string;
  definitions: Endpoint[];
};

// todo remove
type Temp = {
  id: string;
  serviceId: string;
  name: string;
  type: EndpointType;
  isCommon: boolean;
  fileName: string;
  definitions: Endpoint[];
};
