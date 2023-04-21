export type EndpointRequestData = {
  id: string;
  name: string;
  required: boolean;
  description?: string;
  type: string;
  schemaData?: string | EndpointRequestData[];
  arrayData?: string | EndpointRequestData[];
  arrayType?: string;
  enum?: string[];
  integerFormat?: string;
  in?: string;
  default?: string;
  value?: string;
  testValue?: string;
};
