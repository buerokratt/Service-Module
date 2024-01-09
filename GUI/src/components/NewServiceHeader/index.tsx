import { t } from "i18next";
import React, { FC } from "react";
import { Button, HeaderStepCounter, Track } from "..";
import { PreDefinedEndpointEnvVariables } from "../../types/endpoint";
import useServiceStore from "store/new-services.store";
import "@buerokratt-ria/header/src/header/Header.scss";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
  availableVariables?: PreDefinedEndpointEnvVariables;
  flow?: string;
  secrets?: { [key: string]: any };
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
  serviceId,
  isCommon = false,
}) => {
  const endpoints = useServiceStore(state => state.endpoints);
  const isSaveButtonEnabled = useServiceStore(state => state.isSaveButtonEnabled());
  const isTestButtonVisible = useServiceStore(state => state.isTestButtonVisible);
  const isTestButtonEnabled = useServiceStore(state => state.isTestButtonEnabled);
  const serviceName = useServiceStore(state => state.serviceNameDashed());

  function runServiceTest(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

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
