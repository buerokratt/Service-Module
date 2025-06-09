import React, { FC } from "react";
import { t } from "i18next";
import { Button, HeaderStepCounter, Track } from "..";
import useServiceStore from "store/new-services.store";
import "@buerokratt-ria/header/src/Header.scss";
import { ROUTES } from "resources/routes-constants";
import { useNavigate } from "react-router-dom";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
  deleteOnClick: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({ activeStep, continueOnClick, deleteOnClick }) => {
  const name = useServiceStore((state) => state.serviceNameDashed());
  const navigate = useNavigate();

  return (
    <header className="header" style={{ paddingLeft: 24 }}>
      <Track justify="between" gap={16}>
        <Button
          appearance="text"
          style={{ textDecoration: "none", boxShadow: "none" }}
          onClick={() => {
            navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
            useServiceStore.getState().resetState();
          }}
        >
          <h1 style={{ whiteSpace: "nowrap", color: "black" }}>{`< ${t("menu.backToServiceListing")}`}</h1>
        </Button>
        <HeaderStepCounter activeStep={activeStep} />
        <Button appearance="error" onClick={deleteOnClick}>
          {t("serviceFlow.apiElements.delete")}
        </Button>
        <Button onClick={continueOnClick} disabled={!name}>
          {t("global.continue")}
        </Button>
      </Track>
    </header>
  );
};

export default NewServiceHeader;
