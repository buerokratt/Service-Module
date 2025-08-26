import { DynamicChoices } from './dynamic-choices';
import { EndpointData } from './endpoint';
import { MultiChoiceQuestion } from './multi-choice-question';
import { StepType } from './step-type.enum';
import { Edge, Node } from '@xyflow/react';

export const GRID_UNIT = 16;
export const EDGE_LENGTH = 5 * GRID_UNIT;
const startNodeId = crypto.randomUUID();
const ghostNodeId = crypto.randomUUID();

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
  dynamicChoices?: DynamicChoices;
  childrenCount?: number;
  endpoint?: EndpointData;
};

export const initialNodes: Node[] = [
  {
    id: startNodeId,
    type: 'start',
    position: {
      x: 0,
      y: 0,
    },
    data: {
      type: 'start',
    },
    className: 'start',
    selectable: false,
    draggable: false,
  },
  {
    id: ghostNodeId,
    type: 'ghost',
    position: {
      x: 0,
      y: 150,
    },
    data: {
      type: 'ghost',
    },
    className: 'ghost',
    selectable: false,
    draggable: false,
  },
];

export const initialEdges: Edge[] = [
  {
    type: 'step',
    id: `edge-${startNodeId}-${ghostNodeId}`,
    source: startNodeId,
    target: ghostNodeId,
    animated: true,
    deletable: false,
  },
];
