export interface Assign {
  id: string;
  key: string;
  value: string;
  isValueManual?: boolean;
  data?: unknown;
  slots?: [Assign] | [Assign, Assign];
  tooltip?: string;
  isObject?: boolean;
}
