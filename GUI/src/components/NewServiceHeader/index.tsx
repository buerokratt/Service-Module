import { t } from "i18next";
import React, { FC } from "react";
import { Button, HeaderStepCounter, Track } from "..";
import { EndpointData, PreDefinedEndpointEnvVariables } from "../../types/endpoint";
import "@buerokratt-ria/header/src/header/Header.scss";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
  availableVariables?: PreDefinedEndpointEnvVariables;
  endpoints?: EndpointData[];
  flow?: string;
  secrets?: { [key: string]: any };
  serviceName?: string;
  serviceDescription?: string;
  isCommon?: boolean;
  serviceId?: string;
  isSaveButtonEnabled?: boolean;
  isTestButtonVisible?: boolean;
  isTestButtonEnabled?: boolean;
  onTestButtonClick?: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({
  activeStep,
  availableVariables,
  continueOnClick,
  saveDraftOnClick,
  endpoints,
  flow,
  secrets,
  serviceDescription,
  serviceName,
  serviceId,
  isCommon = false,
  isSaveButtonEnabled = true,
  isTestButtonVisible = false,
  isTestButtonEnabled = true,
  onTestButtonClick,
}) => {
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
            <Button onClick={onTestButtonClick} disabled={!isTestButtonEnabled}>
              {t("global.testService")}
            </Button>
          )}
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
