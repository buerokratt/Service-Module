export interface Assign {
  id: string;
  key: string;
  value: string;
  data?: unknown;
  slots?: [Assign] | [Assign, Assign];
}
