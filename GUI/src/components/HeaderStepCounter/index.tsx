import React, { FC, useEffect } from "react";
import { Track } from "..";
import Step from "./HeaderStep";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useServiceStore from "store/new-services.store";
import "./HeaderStepCounter.scss";

type StepCounterProps = {
  activeStep: number;
};

const HeaderStepCounter: FC<StepCounterProps> = ({ activeStep }) => {
  const { t } = useTranslation();
  const { id } = useParams();

  useEffect(() => {
    if(id) {
      useServiceStore.getState().setServiceId(id);
    }
  }, [id]);

  return (
    <Track className="header-step-counter" gap={24}>
      <Step
        step={1}
        activeStep={activeStep}
        name={t("newService.serviceFlowCreation")}
        onClick={() => {}}
      />
      <Step
        step={2}
        activeStep={activeStep}
        name={t("newService.connectToIntent")}
        onClick={() => {}}
      />
    </Track>
  );
};

export default HeaderStepCounter;
