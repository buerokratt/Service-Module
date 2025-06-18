import { MultiChoiceQuestion } from "./multi-choice-question";
import { StepType } from "./step-type.enum";
import { Edge, Node } from "@xyflow/react";

export const GRID_UNIT = 16;
export const EDGE_LENGTH = 5 * GRID_UNIT;

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
      x: 0,
      y: 0,
    },
    data: {
      type: "start",
    },
    className: "start",
    selectable: false,
    draggable: false,
  },
  {
    id: "2",
    data: { label: "🌮 Taco" },
    position: { x: 0, y: 150 },
    type: "step",
  },
  {
    id: "3",
    data: { label: "🌮 Taco" },
    position: { x: 0, y: 150 },
    type: "step",
  },
  {
    id: "4",
    type: "placeholder",
    position: {
      x: 0,
      y: 150,
    },
    data: {
      type: "placeholder",
      label: "+",
    },
    className: "placeholder",
    width: 20,
  },
];

export const initialEdges: Edge[] = [
  {
    id: "1=>2",
    source: "1",
    target: "2",
    type: "placeholder",
  },
  {
    id: "2=>3",
    source: "2",
    target: "3",
    type: "step",
  },
  {
    id: "3=>4",
    source: "3",
    target: "4",
    type: "placeholder",
  },
];
