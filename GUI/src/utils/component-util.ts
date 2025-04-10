import { Step } from "types";

export const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
  event.dataTransfer.setData("application/reactflow-label", step.label);
  event.dataTransfer.setData("application/reactflow-type", step.type);
  event.dataTransfer.setData("application/reactflow-originalDefinedNodeId", step.data?.id ?? "");
  event.dataTransfer.effectAllowed = "move";
};
