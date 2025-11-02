import { FC } from 'react';
import useServiceStore from 'store/new-services.store';

import Track from '../Track';
import AssignBuilder from './AssignBuilder';
import PreviousVariables from './PreviousVariables';
import { Node } from '@xyflow/react';
import { NodeDataProps } from 'types/service-flow';

type AssignContentProps = {
  readonly node: Node<NodeDataProps>;
};

const AssignContent: FC<AssignContentProps> = ({ node }) => {
  const nodes = useServiceStore((state) => state.nodes);
  const currentNodeElements = nodes.findLast((n) => n.id === node.id)?.data?.assignElements ?? [];

  return (
    <Track direction="vertical" align="stretch">
      <AssignBuilder onChange={useServiceStore.getState().changeAssignNode} seedGroup={currentNodeElements} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default AssignContent;
