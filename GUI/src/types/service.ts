import { ServiceState } from "./service-state";

export interface Service {
  id: number;
  name: string;
  type: string;
  usedCount: number;
  state: ServiceState;
}
