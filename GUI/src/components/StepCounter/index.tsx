import React, { FC } from "react";
import { Track } from "../../components";
import "./StepCounter.scss";
import Step from "./Step";
import { useTranslation } from "react-i18next";

const StepCounter: FC = () => {
  const { t } = useTranslation();

  return (
    <Track className="step-counter" gap={24}>
      <Step step={1} name={t("newService.trainingModuleSetup")} />
      <Step step={2} name={t("newService.serviceSetup")} isActive />
      <Step step={3} name={t("newService.serviceFlowCreation")} />
    </Track>
  );
};

export default StepCounter;
