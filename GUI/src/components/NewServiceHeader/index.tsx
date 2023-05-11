import { t } from "i18next";
import React, { FC } from "react";
import { Button, HeaderStepCounter, Track } from "..";
import { EndpointData } from "../../types/endpoint";
import "../Header/Header.scss";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
  endpoints?: EndpointData[];
  flow?: string;
  secrets?: { [key: string]: any };
  serviceName?: string;
  serviceDescription?: string;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({
  activeStep,
  continueOnClick,
  saveDraftOnClick,
  endpoints,
  flow,
  secrets,
  serviceDescription,
  serviceName,
}) => {
  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <h1 style={{ whiteSpace: "nowrap" }}>{t("menu.newService")}</h1>
          <HeaderStepCounter
            activeStep={activeStep}
            endpoints={endpoints}
            flow={flow}
            secrets={secrets}
            serviceDescription={serviceDescription}
            serviceName={serviceName}
          />
          <Button onClick={saveDraftOnClick} appearance="secondary">
            {t("newService.saveDraft")}
          </Button>
          <Button onClick={continueOnClick}>{t("global.continue")}</Button>
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
