export interface Assign {
  id: string;
  key: string;
  value: string;
  data?: unknown;
  // todo from here
  slots?: [Assign, Assign];
}

// // todo merge + names?
// export interface AssignSlot {
//   id?: string;
//   key: string;
//   value: string;
//   data?: unknown;
// }
