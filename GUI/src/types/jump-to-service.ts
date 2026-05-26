import { Assign } from './assign';

export interface JumpToService {
  serviceName: string;
  serviceId?: string;
  input: Assign[];
}
