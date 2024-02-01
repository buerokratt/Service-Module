import React from "react";
import { useTranslation } from "react-i18next";
import { SwitchBox } from "../FormElements";
import { Track } from "..";
import YesNoPopupContent from "./YesNoPopupContent";
import RuleBuilder from "./RuleBuilder";
import useFlowStore from "store/flow.store";
import "./styles.scss";

const ConditionBuilderContent: React.FC = () => {
  const { t } = useTranslation();
  const isYesNoQuestion = useFlowStore(state => state.isYesNoQuestion);

  return (
    <Track direction="vertical" align="stretch">
      <Track gap={16} className="flow-body-padding">
        <Track>
          <SwitchBox 
            label="" 
            name="" 
            hideLabel 
            onCheckedChange={useFlowStore.getState().setIsYesNoQuestion} 
            checked={isYesNoQuestion} 
            />
        </Track>
        <span>{t("serviceFlow.popup.yesNoQuestion")}</span>
      </Track>
      {isYesNoQuestion && <YesNoPopupContent />}
      {!isYesNoQuestion && <RuleBuilder />}
    </Track>
  );
};

export default ConditionBuilderContent;
