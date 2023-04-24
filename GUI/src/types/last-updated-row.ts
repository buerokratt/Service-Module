export type LastUpdatedRow = {
  type: "variable" | "value";
  rowId: string;
  endpointCardId?: string;
};
