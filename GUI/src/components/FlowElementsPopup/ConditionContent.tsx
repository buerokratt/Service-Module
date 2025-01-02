import { FC, useState } from "react";
import Track from "../Track";
import RuleBuilder from "./RuleBuilder";
import useServiceStore from "store/new-services.store";
import PreviousVariables from "./PreviousVariables";

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
