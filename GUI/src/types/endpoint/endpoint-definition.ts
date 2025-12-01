import { RawData } from '../raw-data';
import { EndpointType } from './endpoint-type';
import { EndpointVariableData } from './endpoint-variable-data';

export type EndpointDefinition = {
  id: string;
  label: string;
  path: string;
  methodType: string;
  type: EndpointType;
  dataType: 'raw' | 'custom';
  supported: boolean;
  isSelected: boolean;
  url?: string;
  openApiUrl?: string;
  description?: string;
  params?: {
    variables: EndpointVariableData[];
    rawData: RawData;
    isRowSelected?: boolean;
  };
  headers?: {
    variables: EndpointVariableData[];
    rawData: RawData;
    isRowSelected?: boolean;
  };
  body?: {
    variables: EndpointVariableData[];
    rawData: RawData;
    isRowSelected?: boolean;
  };
  response?: EndpointVariableData[];
};
