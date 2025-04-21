export interface Assign {
  id: string;
  key: string;
  value: string;
  data?: unknown;
  // todo from here
  slots?: [Assign] | [Assign, Assign];
}
