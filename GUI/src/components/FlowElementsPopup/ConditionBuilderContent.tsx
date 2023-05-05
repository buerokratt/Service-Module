import React from "react";
import { SwitchBox } from "../FormElements";
import { Track } from "..";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import './styles.scss'
import { ConditionRuleType } from "../../types";

interface ConditionBuilderContentProps {
  isYesNoQuestion: boolean
  setIsYesNoQuestion: (x: boolean) => void
  rules: ConditionRuleType[]
  setRules: (x: ConditionRuleType[]) => void
}

const ConditionBuilderContent: React.FC<ConditionBuilderContentProps> = ({
  setIsYesNoQuestion,
  isYesNoQuestion,
  rules,
  setRules,
}) => {
  return (
    <Track direction='vertical' align='stretch'>
      <Track gap={16} className="flow-body-padding">
        <Track>
          <SwitchBox
            label=''
            name=''
            hideLabel
            onCheckedChange={setIsYesNoQuestion}
            checked={isYesNoQuestion}
          />
        </Track>
        <span>Yes/No Question</span>
      </Track>
      {isYesNoQuestion && <YesNoPopupContent />}
      {
        !isYesNoQuestion &&
        <RulesBuilder
          rules={rules}
          setRules={setRules}
        />
      }
    </Track>
  )
}

export default ConditionBuilderContent
