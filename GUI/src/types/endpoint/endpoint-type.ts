import { RawData } from "../raw-data";
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
  params?: {
    variables: EndpointVariableData[];
    rawData: RawData;
  };
  headers?: {
    variables: EndpointVariableData[];
    rawData: RawData;
  };
  body?: {
    variables: EndpointVariableData[];
    rawData: RawData;
  };
  response?: EndpointVariableData[];
};
