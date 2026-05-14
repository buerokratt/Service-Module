import { RequestOperator } from 'types/endpoint/request-operator';

export type RequestVariablesTableColumns = {
  id: string;
  isNameEditable: boolean;
  required: boolean;
  nestedLevel: number;
  arrayType?: string;
  description?: string;
  mandatory?: boolean;
  endpointVariableId?: string;
  type?: string;
  value?: string;
  variable?: string;
  operator?: RequestOperator;
};
