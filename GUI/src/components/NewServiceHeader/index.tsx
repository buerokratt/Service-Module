import React, { FC } from "react";
import { t } from "i18next";
import { Button, HeaderStepCounter, Track } from "..";
import useServiceStore from "store/new-services.store";
import { runServiceTest } from "services/service-builder";
import "@buerokratt-ria/header/src/Header.scss";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({
  activeStep,
  continueOnClick,
  saveDraftOnClick,
}) => {
  const isSaveButtonEnabled = useServiceStore(state => state.isSaveButtonEnabled());
  const isTestButtonVisible = useServiceStore(state => state.isTestButtonVisible);
  const isTestButtonEnabled = useServiceStore(state => state.isTestButtonEnabled);

  return (
    <header className="header" style={{ paddingLeft: 24 }}>
      <Track justify="between" gap={16}>
        <h1 style={{ whiteSpace: "nowrap" }}>{t("menu.newService")}</h1>
        <HeaderStepCounter activeStep={activeStep} />
        <Button onClick={saveDraftOnClick} appearance="secondary" disabled={!isSaveButtonEnabled}>
          {t("newService.saveDraft")}
        </Button>
        <Button onClick={continueOnClick} disabled={activeStep === 3 && !isTestButtonVisible}>
          {t("global.continue")}
        </Button>
        {isTestButtonVisible && (
          <Button onClick={runServiceTest} disabled={!isTestButtonEnabled}>
            {t("global.testService")}
          </Button>
        )}
      </Track>
    </header>
  );
};

export default NewServiceHeader;
