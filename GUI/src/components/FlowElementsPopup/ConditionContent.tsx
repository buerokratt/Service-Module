import { FC } from 'react';
import useServiceStore from 'store/new-services.store';

import Track from '../Track';
import PreviousVariables from './PreviousVariables';
import RuleBuilder from './RuleBuilder';
import { Node } from '@xyflow/react';
import { NodeDataProps } from 'types/service-flow';

type ConditionContentProps = {
  readonly node: Node<NodeDataProps>;
};

const ConditionContent: FC<ConditionContentProps> = ({ node }) => {
  const rules = useServiceStore((state) => state.rules);

  return (
    <Track direction="vertical" align="stretch">
      <RuleBuilder onChange={useServiceStore.getState().changeRulesNode} seedGroup={rules} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default ConditionContent;
