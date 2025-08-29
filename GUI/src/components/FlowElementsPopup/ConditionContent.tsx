import { FC } from 'react';
import useServiceStore from 'store/new-services.store';

import Track from '../Track';
import PreviousVariables from './PreviousVariables';
import RuleBuilder from './RuleBuilder';

type ConditionContentProps = {
  readonly nodeId: string;
};

const ConditionContent: FC<ConditionContentProps> = ({ nodeId }) => {
  const rules = useServiceStore((state) => state.rules);

  return (
    <Track direction="vertical" align="stretch">
      <RuleBuilder onChange={useServiceStore.getState().changeRulesNode} seedGroup={rules} />
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default ConditionContent;
