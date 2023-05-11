import { ServiceState } from "./service-state";

export interface Service {
  readonly id: number;
  readonly name: string;
  usedCount: number;
  readonly state: ServiceState;
  readonly type: "GET" | "POST";
}
