import React, { FC, useContext } from "react";
import { Track } from "..";
import "./HeaderStepCounter.scss";
import Step from "./HeaderStep";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../resources/routes-constants";
import { EndpointData, PreDefinedEndpointEnvVariables } from "../../types/endpoint";
import { ToastContext } from "components/Toast/ToastContext";

type StepCounterProps = {
  activeStep: number;
  availableVariables?: PreDefinedEndpointEnvVariables;
  endpoints?: EndpointData[];
  flow?: string;
  secrets?: { [key: string]: any };
  serviceName?: string;
  serviceId?: string;
  serviceDescription?: string;
  isCommon?: boolean;
};

const HeaderStepCounter: FC<StepCounterProps> = ({
  activeStep,
  availableVariables,
  endpoints,
  flow,
  serviceId,
  serviceDescription,
  secrets,
  serviceName,
  isCommon,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);

  return (
    <Track className="header-step-counter" gap={24}>
      <Step step={1} activeStep={activeStep} name={t("newService.trainingModuleSetup")} />
      <Step
        step={2}
        activeStep={activeStep}
        name={t("newService.serviceSetup")}
        onClick={() =>
          navigate(ROUTES.NEWSERVICE_ROUTE, {
            state: {
              availableVariables,
              endpoints,
              flow,
              serviceDescription,
              serviceName,
              serviceId,
              isCommon,
              secrets,
            },
          })
        }
      />
      <Step
        step={3}
        activeStep={activeStep}
        name={t("newService.serviceFlowCreation")}
        onClick={() => {
          if (serviceName && serviceDescription) {
            navigate(ROUTES.FLOW_ROUTE, {
              state: {
                availableVariables,
                endpoints,
                flow,
                serviceDescription,
                serviceName,
                serviceId,
                isCommon,
                secrets,
              },
            });
          } else {
            toast.open({
              type: "error",
              title: t("newService.toast.missingFields"),
              message: t("newService.toast.serviceMissingFields"),
            });
          }
        }}
      />
    </Track>
  );
};

export default HeaderStepCounter;
