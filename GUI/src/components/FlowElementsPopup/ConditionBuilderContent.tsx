import React from "react";
import { useTranslation } from "react-i18next";
import { SwitchBox } from "../FormElements";
import { Track } from "..";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import { PreDefinedEndpointEnvVariables } from "../../types/endpoint";
import useFlowStore from "store/flow.store";
import "./styles.scss";

interface ConditionBuilderContentProps {
  availableVariables?: PreDefinedEndpointEnvVariables;
}

const ConditionBuilderContent: React.FC<ConditionBuilderContentProps> = ({
  availableVariables,
}) => {
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
      {!isYesNoQuestion && <RulesBuilder availableVariables={availableVariables} />}
    </Track>
  );
};

export default ConditionBuilderContent;
