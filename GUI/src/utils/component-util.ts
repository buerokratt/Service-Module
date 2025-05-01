import { Step } from "types";

const UPPERCASE_PREFIX = "^{";
const UPPERCASE_SUFFIX = "}^";

export const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
  event.dataTransfer.setData("application/reactflow-label", step.label);
  event.dataTransfer.setData("application/reactflow-type", step.type);
  event.dataTransfer.setData("application/reactflow-originalDefinedNodeId", step.data?.id ?? "");
  event.dataTransfer.effectAllowed = "move";
};

export const getDragData = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  // todo clean up?
  return JSON.parse(decodeDragData(event.dataTransfer.types[0]));
};

// Below is a workaround to get the data in drag events
// https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
export const encodeDragData = (str: string): string => {
  return str.replace(/([A-Z]+)/g, `${UPPERCASE_PREFIX}$1${UPPERCASE_SUFFIX}`);
};

export const decodeDragData = (str: string): string => {
  const escapeRegExp = (escape: string) => ["", ...escape.split("")].join("\\");

  return str.replace(
    new RegExp(`${escapeRegExp(UPPERCASE_PREFIX)}(.*?)${escapeRegExp(UPPERCASE_SUFFIX)}`, "g"),
    (_, p1: string) => p1.toUpperCase()
  );
};
