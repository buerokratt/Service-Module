import React from "react";
import { SwitchBox } from "../FormElements";
import { Track } from "..";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import "./styles.scss";
import { ConditionRuleType } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { PreDefinedEndpointEnvVariables } from "../../types/endpoint";

interface ConditionBuilderContentProps {
  isYesNoQuestion: boolean;
  setIsYesNoQuestion: (x: boolean) => void;
  rules: ConditionRuleType[];
  setRules: (x: ConditionRuleType[]) => void;
  availableVariables?: PreDefinedEndpointEnvVariables;
}

const ConditionBuilderContent: React.FC<ConditionBuilderContentProps> = ({
  availableVariables,
  setIsYesNoQuestion,
  isYesNoQuestion,
  rules,
  setRules,
}) => {
  const handleCheckedChange = (isChecked: boolean) => {
    if (isChecked) {
      setRules([
        {
          id: uuidv4(),
          name: "",
          condition: "Yes",
          value: "",
        },
        {
          id: uuidv4(),
          name: "",
          condition: "No",
          value: "",
        },
      ]);
    } else {
      setRules([]);
    }
    setIsYesNoQuestion(isChecked);
  };

  return (
    <Track direction="vertical" align="stretch">
      <Track gap={16} className="flow-body-padding">
        <Track>
          <SwitchBox label="" name="" hideLabel onCheckedChange={handleCheckedChange} checked={isYesNoQuestion} />
        </Track>
        <span>Yes/No Question</span>
      </Track>
      {isYesNoQuestion && <YesNoPopupContent />}
      {!isYesNoQuestion && <RulesBuilder availableVariables={availableVariables} rules={rules} setRules={setRules} />}
    </Track>
  );
};

export default ConditionBuilderContent;
