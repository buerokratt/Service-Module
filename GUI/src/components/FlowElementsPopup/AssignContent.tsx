import { Node } from '@xyflow/react';
import { FC } from 'react';
import useServiceStore from 'store/new-services.store';
import { Assign } from 'types';
import { NodeDataProps } from 'types/service-flow';

import Track from '../Track';
import AssignBuilder from './AssignBuilder';
import PreviousVariables from './PreviousVariables';

type AssignContentProps = {
  readonly node: Node<NodeDataProps>;
};

const AssignContent: FC<AssignContentProps> = ({ node }) => {
  const nodes = useServiceStore((state) => state.nodes);
  const currentNodeElements = (nodes.findLast((n) => n.id === node.id)?.data?.assignElements as Assign[]) ?? [];

  return (
    <Track direction="vertical" align="stretch">
      <AssignBuilder onChange={useServiceStore.getState().changeAssignNode} seedGroup={currentNodeElements} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default AssignContent;
