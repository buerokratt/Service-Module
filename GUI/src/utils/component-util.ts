import { Step } from "types";

export const ASSIGN_DRAG_DATA = "assign-drag-data";

export const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
  event.dataTransfer.setData("application/reactflow-label", step.label);
  event.dataTransfer.setData("application/reactflow-type", step.type);
  event.dataTransfer.setData("application/reactflow-originalDefinedNodeId", step.data?.id ?? "");
  event.dataTransfer.effectAllowed = "move";
};

export const getDragData = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  return JSON.parse(event.dataTransfer.getData(ASSIGN_DRAG_DATA));
};
