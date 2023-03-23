import { t } from "i18next";
import React, { FC } from "react";
import { Button, StepCounter, Track } from "..";
import "../Header/Header.scss";

const NewServiceHeader: FC = () => {
  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <h1 style={{ whiteSpace: "nowrap" }}>{t("menu.newService")}</h1>
          <StepCounter />
          <Button appearance="secondary">{t("newService.saveDraft")}</Button>
          <Button>{t("global.continue")}</Button>
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
