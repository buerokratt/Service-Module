import { FC } from 'react';
import useServiceStore from 'store/new-services.store';
import { Assign } from 'types';

import Track from '../Track';
import AssignBuilder from './AssignBuilder';
import PreviousVariables from './PreviousVariables';

type AssignContentProps = {
  readonly nodeId: string;
};

const AssignContent: FC<AssignContentProps> = ({ nodeId }) => {
  const nodes = useServiceStore((state) => state.nodes);
  const currentNodeElements = (nodes.findLast((node) => node.id === nodeId)?.data?.assignElements as Assign[]) ?? [];

  return (
    <Track direction="vertical" align="stretch">
      <AssignBuilder onChange={useServiceStore.getState().changeAssignNode} seedGroup={currentNodeElements} />
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default AssignContent;
