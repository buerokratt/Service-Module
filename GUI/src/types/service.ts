import { ServiceState } from "./service-state";

export interface Service {
  name: string;
  usedCount: number;
  state: ServiceState;
}
