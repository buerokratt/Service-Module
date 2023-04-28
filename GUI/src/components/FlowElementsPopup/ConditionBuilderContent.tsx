import React from "react";
import { SwitchBox } from "../FormElements";
import { Track } from "..";
import ConditiobRuleType from "./ConditiobRuleType";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import './styles.scss'

interface ConditionBuilderContentProps {
  isYesNoQuestion: boolean
  setIsYesNoQuestion: (x: boolean) => void
  rules: ConditiobRuleType[]
  setRules: (x: ConditiobRuleType[]) => void
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
