import React, { FC } from "react";
import { Track } from "../../components";
import "./StepCounter.scss";
import Step from "./Step";
import { useTranslation } from "react-i18next";

type StepCounterProps = {
  activeStep: number;
}

const StepCounter: FC<StepCounterProps> = ({activeStep}) => {
  const { t } = useTranslation();

  return (
    <Track className="step-counter" gap={24}>
      <Step step={1} activeStep={activeStep} name={t("newService.trainingModuleSetup")} />
      <Step step={2} activeStep={activeStep} name={t("newService.serviceSetup")} />
      <Step step={3} activeStep={activeStep} name={t("newService.serviceFlowCreation")} />
    </Track>
  );
};

export default StepCounter;
