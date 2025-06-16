import { NodeTypes } from '@xyflow/react';

import PlaceholderNode from './PlaceholderNode';
import StepNode from './StepNode';
import StartNode from './StartNode';
// import PlaceholderNode from "../../Steps/PlaceholderNode";

const nodeTypes: NodeTypes = {
  start: StartNode,
  step: StepNode,
  placeholder: PlaceholderNode,
};

export default nodeTypes;
