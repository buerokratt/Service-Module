import { t } from "i18next";
import React, { FC } from "react";
import { Button, HeaderStepCounter, Track } from "..";
import "../Header/Header.scss";


type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
}

const NewServiceHeader: FC<NewServiceHeaderProps> = ({activeStep, continueOnClick}) => {
  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <h1 style={{ whiteSpace: "nowrap" }}>{t("menu.newService")}</h1>
          <HeaderStepCounter activeStep={activeStep} />
          <Button appearance="secondary">{t("newService.saveDraft")}</Button>
          <Button onClick={continueOnClick}>{t("global.continue")}</Button>
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
