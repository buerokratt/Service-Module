import { ServiceStatus } from "./service-status";

export interface Service {
  name: string;
  usedCount: number;
  state: ServiceStatus;
}
