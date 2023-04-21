import { EndpointRequestData } from "./endpoint-request-data";

export type EndpointType = {
  id: string;
  label: string;
  path: string;
  methodType: string;
  supported: boolean;
  isSelected: boolean;
  description?: string;
  params?: EndpointRequestData[];
  headers?: EndpointRequestData[];
  body?: EndpointRequestData[];
};
