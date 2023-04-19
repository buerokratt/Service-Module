export type EndpointType = {
  label: string;
  value: string;
  url: string;
  methodType: string;
  supported: boolean;
  description?: string;
  params?: any[];
  headers?: any[];
  body?: any[];
};
