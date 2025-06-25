import { MultiChoiceQuestion } from "./multi-choice-question";
import { StepType } from "./step-type.enum";
import { Edge, Node } from "@xyflow/react";

export const GRID_UNIT = 16;
export const EDGE_LENGTH = 5 * GRID_UNIT;

export const initialEdges: Edge[] = [
  {
    type: "step",
    id: "edge-1-2",
    source: "1",
    target: "2",
    animated: true,
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
    type: "start",
    position: {
      x: 13.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {
      type: "start"
    },
    className: "start",
    selectable: false,
    draggable: false,
  },
  {
    id: "2",
    type: "ghost",
    position: {
      x: 3 * GRID_UNIT,
      y: 11 * GRID_UNIT,
    },
    data: {
      type: "ghost",
    },
    className: "ghost",
    selectable: false,
    draggable: false,
  },
];
