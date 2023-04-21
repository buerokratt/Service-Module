export type EndpointRequestData = {
  name: string;
  required: boolean;
  description?: string;
  type: string;
  schemaData?: string | EndpointRequestData[];
  arrayData?: string | EndpointRequestData[];
  enum?: string[];
  integerFormat?: string;
  in?: string;
  default?: string;
  value?: string;
  testValue?: string;
};
