import { Assign } from './assign';

export interface JumpToService {
  readonly serviceName: string;
  readonly serviceId?: string;
  readonly input: Assign[];
}
