import React, { FC } from "react";
import { Track } from "..";
import "./HeaderStepCounter.scss";
import Step from "./HeaderStep";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../resources/routes-constants";
import useToastStore from "store/toasts.store";
import useServiceStore from "store/new-services.store";

type StepCounterProps = {
  activeStep: number;
  serviceId?: string;
};

const HeaderStepCounter: FC<StepCounterProps> = ({ activeStep, serviceId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const vaildService = useServiceStore(state => state.vaildServiceInfo());

  return (
    <Track className="header-step-counter" gap={24}>
      <Step step={1} activeStep={activeStep} name={t("newService.trainingModuleSetup")} />
      <Step
        step={2}
        activeStep={activeStep}
        name={t("newService.serviceSetup")}
        onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}
      />
      <Step
        step={3}
        activeStep={activeStep}
        name={t("newService.serviceFlowCreation")}
        onClick={() => {
          if (!vaildService) {
            useToastStore.getState().error({
              title: t("newService.toast.missingFields"),
              message: t("newService.toast.serviceMissingFields"),
            });
            return;
          }

          navigate(`${ROUTES.FLOW_ROUTE}/${serviceId}`);
        }}
      />
    </Track>
  );
};

export default HeaderStepCounter;
