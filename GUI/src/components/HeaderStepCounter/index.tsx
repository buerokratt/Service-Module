import React, { FC } from "react";
import { Track } from "..";
import Step from "./HeaderStep";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../resources/routes-constants";
import useServiceStore from "store/new-services.store";
import "./HeaderStepCounter.scss";

type StepCounterProps = {
  activeStep: number;
};

const HeaderStepCounter: FC<StepCounterProps> = ({ activeStep }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Track className="header-step-counter" gap={24}>
      <Step 
        step={1}
        activeStep={activeStep}
        name={t("newService.trainingModuleSetup")} 
        onClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
      />
      <Step
        step={2}
        activeStep={activeStep}
        name={t("newService.serviceSetup")}
        onClick={() => {
          if(id) {
            navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, id));
          } else {
            navigate(ROUTES.NEWSERVICE_ROUTE);
          }
        }}
      />
      <Step
        step={3}
        activeStep={activeStep}
        name={t("newService.serviceFlowCreation")}
        onClick={() => useServiceStore.getState().onContinueClick(id, navigate)}
      />
    </Track>
  );
};

export default HeaderStepCounter;
