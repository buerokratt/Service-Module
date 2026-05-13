import { RequestOperator } from './request-operator';

export type EndpointVariableData = {
  id: string;
  name: string;
  required?: boolean;
  mandatory?: boolean;
  description?: string;
  type: string;
  operator?: RequestOperator;
  schemaData?: string | EndpointVariableData[];
  arrayData?: string | EndpointVariableData[];
  arrayType?: string;
  enum?: string[];
  integerFormat?: string;
  in?: string;
  default?: string;
  value?: string;
  testValue?: string;
};
