export interface Step {
  readonly id: number;
  label: string;
  type:
    | "auth"
    | "textfield"
    | "input"
    | "rule-definition"
    | "open-webpage"
    | "file-generate"
    | "file-sign"
    | "step"
    | "rule"
    | "finishing-step-end"
    | "finishing-step-redirect";
  action?: string;
}
