import React, { FC } from "react";
import { t } from "i18next";
import { Button, HeaderStepCounter, Track } from "..";
import "@buerokratt-ria/header/src/header/Header.scss";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  saveDraftOnClick: () => void;
  isSaveButtonEnabled?: boolean;
  isTestButtonVisible?: boolean;
  isTestButtonEnabled?: boolean;
  onTestButtonClick?: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({
  activeStep,
  continueOnClick,
  saveDraftOnClick,
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
          <HeaderStepCounter activeStep={activeStep} />
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
