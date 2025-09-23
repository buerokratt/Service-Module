import { RequestOperator } from "types/endpoint/request-operator";

export type RequestVariablesRowData = {
  id: string;
  isNameEditable: boolean;
  required: boolean;
  nestedLevel: number;
  arrayType?: string;
  description?: string;
  operator?: RequestOperator;
  endpointVariableId?: string;
  type?: string;
  value?: string;
  variable?: string;
};
