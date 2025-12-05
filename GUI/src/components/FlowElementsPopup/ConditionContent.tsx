import { Node } from '@xyflow/react';
import { FC } from 'react';
import useServiceStore from 'store/new-services.store';
import { NodeDataProps } from 'types/service-flow';

import Track from '../Track';
import PreviousVariables from './PreviousVariables';
import RuleBuilder from './RuleBuilder';
import { Group } from './RuleBuilder/types';

type ConditionContentProps = {
  readonly node: Node<NodeDataProps>;
};

const ConditionContent: FC<ConditionContentProps> = ({ node }) => {
  const rules = useServiceStore((state) => state.rules);
  const seedGroup = node.data?.rules || (Array.isArray(rules) && rules.length > 0 ? rules : undefined);

  return (
    <Track direction="vertical" align="stretch">
      <RuleBuilder
        onChange={(group: Group) => useServiceStore.getState().changeRulesNode(group.children)}
        seedGroup={seedGroup}
      />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default ConditionContent;
