export type EndpointVariableData = {
  id: string;
  name: string;
  required?: boolean;
  description?: string;
  type: string;
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
