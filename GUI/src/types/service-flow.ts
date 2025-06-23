import { MultiChoiceQuestion } from "./multi-choice-question";
import { StepType } from "./step-type.enum";
import { Edge, MarkerType, Node } from "@xyflow/react";

export const GRID_UNIT = 16;
export const EDGE_LENGTH = 5 * GRID_UNIT;

export const initialPlaceholder = {
  id: "2",
  type: "placeholder",
  position: {
    x: 11.12 * GRID_UNIT,
    y: 9 * GRID_UNIT,
  },
  data: {
    type: "placeholder",
  },
  className: "placeholder",
  selectable: false,
  draggable: false,
};

export const initialEdges: Edge[] = [
  {
    type: "smoothstep",
    id: "edge-1-2",
    source: "1",
    target: "2",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export type NodeDataProps = {
  label: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  type: string;
  stepType: StepType;
  readonly: boolean;
  message?: string;
  link?: string;
  linkText?: string;
  fileName?: string;
  fileContent?: string;
  signOption?: any;
  rules?: any;
  assignElements?: any;
  multiChoiceQuestion?: MultiChoiceQuestion;
  childrenCount?: number;
};

export const initialNodes: Node[] = [
  {
    id: "1",
    type: "startNode",
    position: {
      x: 13.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {},
    className: "start",
    selectable: false,
    draggable: false,
  },
  initialPlaceholder,
];
