import React from "react";
import { useTranslation } from "react-i18next";
import { SwitchBox } from "../FormElements";
import YesNoPopupContent from "./YesNoPopupContent";
import RuleBuilder from "./RuleBuilder";
import { Track } from "..";
import "./styles.scss";
import useServiceStore from "store/new-services.store";

const ConditionBuilderContent: React.FC = () => {
  const { t } = useTranslation();
  const isYesNoQuestion = useServiceStore(state => state.isYesNoQuestion);
  const rules = useServiceStore(state => state.rules);

  return (
    <Track direction="vertical" align="stretch">
      <Track gap={16} className="flow-body-padding">
        <Track>
          <SwitchBox
            label=""
            name=""
            hideLabel
            onCheckedChange={useServiceStore.getState().setIsYesNoQuestion}
            checked={isYesNoQuestion}
          />
        </Track>
        <span>{t("serviceFlow.popup.yesNoQuestion")}</span>
      </Track>
      {isYesNoQuestion && <YesNoPopupContent />}
      {!isYesNoQuestion && <RuleBuilder 
        onChange={useServiceStore.getState().changeRulesNode} 
        seedGroup={rules}
      />}
    </Track>
  );
};

export default ConditionBuilderContent;
