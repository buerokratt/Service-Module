import { ServiceState } from './service-state';

export interface ActivationBlocker {
  readonly serviceId: string;
  readonly name: string;
  readonly state: ServiceState | 'missing';
}
