import { Edge, Node } from '@xyflow/react';
import { Group } from 'components/FlowElementsPopup/RuleBuilder/types';

import { Assign } from './assign';
import { DynamicChoices } from './dynamic-choices';
import { EndpointData } from './endpoint';
import { MultiChoiceQuestion } from './multi-choice-question';
import { StepType } from './step-type.enum';

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
  name?: string;
  condition?: string;
  value?: string;
  message?: string;
  link?: string;
  linkText?: string;
  fileName?: string;
  fileContent?: string;
  signOption?: { label: string; value: string };
  originalDefinedNodeId?: string;
  rules?: Group;
  assignElements?: Assign[];
  multiChoiceQuestion?: MultiChoiceQuestion;
  dynamicChoices?: DynamicChoices;
  childrenCount?: number;
  clientInputId?: number;
  endpoint?: EndpointData;
  testingPassed?: boolean;
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
