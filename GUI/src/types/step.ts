import { StepType } from "./step-type.enum";

export interface Step {
  readonly id: number;
  label: string;
  type: StepType;
  action?: string;
}
