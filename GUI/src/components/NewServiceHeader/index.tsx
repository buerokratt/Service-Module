import { t } from "i18next";
import React, { FC } from "react";
import { Button, HeaderStepCounter, Track } from "..";
import { EndpointData, PreDefinedEndpointEnvVariables } from "../../types/endpoint";
import "@buerokratt-ria/header/src/header/Header.scss";
import useServiceStore from "store/new-services.store";
import { testDraftService } from "resources/api-constants";
import axios from "axios";
import { useToast } from "hooks/useToast";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
  availableVariables?: PreDefinedEndpointEnvVariables;
  flow?: string;
  secrets?: { [key: string]: any };
  serviceName?: string;
  serviceDescription?: string;
  isCommon?: boolean;
  serviceId?: string;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({
  activeStep,
  availableVariables,
  continueOnClick,
  saveDraftOnClick,
  flow,
  secrets,
  serviceDescription,
  serviceName,
  serviceId,
  isCommon = false,
}) => {
  const endpoints = useServiceStore(state => state.endpoints);
  const isSaveButtonEnabled = useServiceStore(state => state.isSaveButtonEnabled());
  const isTestButtonVisible = useServiceStore(state => state.isTestButtonVisible);
  const isTestButtonEnabled = useServiceStore(state => state.isTestButtonEnabled);
  const toast = useToast();

  const runServiceTest = async () => {
    try {
      const serviceName = useServiceStore.getState().serviceName;
      await axios.post(testDraftService(serviceName), {});
      toast.open({
        type: "success",
        title: "Test result- success",
        message: "",
      });
    } catch (error) {
      console.log("ERROR: ", error);
      toast.open({
        type: "error",
        title: "Test result - error",
        message: "",
      });
    }
  };
  
  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <h1 style={{ whiteSpace: "nowrap" }}>{t("menu.newService")}</h1>
          <HeaderStepCounter
            activeStep={activeStep}
            availableVariables={availableVariables}
            endpoints={endpoints}
            flow={flow}
            secrets={secrets}
            serviceDescription={serviceDescription}
            serviceName={serviceName}
            serviceId={serviceId}
            isCommon={isCommon}
          />
          <Button onClick={saveDraftOnClick} appearance="secondary" disabled={!isSaveButtonEnabled}>
            {t("newService.saveDraft")}
          </Button>
          <Button onClick={continueOnClick} disabled={activeStep === 3 && !isTestButtonVisible ? true : false}>
            {t("global.continue")}
          </Button>
          {isTestButtonVisible && (
            <Button onClick={runServiceTest} disabled={!isTestButtonEnabled}>
              {t("global.testService")}
            </Button>
          )}
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
