import { EndpointVariableData } from "./endpoint-variable-data";

export type EndpointType = {
  id: string;
  label: string;
  path: string;
  methodType: string;
  type: "openApi" | "custom";
  supported: boolean;
  isSelected: boolean;
  url?: string;
  description?: string;
  params?: EndpointVariableData[];
  headers?: EndpointVariableData[];
  body?: EndpointVariableData[];
  response?: EndpointVariableData[];
};
