import React, { FC, useState } from "react";
import { t } from "i18next";
import { Button, HeaderStepCounter, Track } from "..";
import useServiceStore from "store/new-services.store";
import "@buerokratt-ria/header/src/Header.scss";
import { ROUTES } from "resources/routes-constants";
import { useNavigate } from "react-router-dom";
import useServiceListStore from "../../store/services.store";
import { ServiceState } from "types";
import { deleteService } from "resources/api-constants";
import api from "../../services/api-dev";

type NewServiceHeaderProps = {
  activeStep: number;
  continueOnClick: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({ activeStep, continueOnClick }) => {
  const name = useServiceStore((state) => state.serviceNameDashed());
  const serviceState = useServiceStore((state) => state.serviceState);
  const selectedService = useServiceListStore((state) => state.selectedService);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <Button
          appearance={isDeleting ? "loading" : "error"}
          disabled={serviceState !== ServiceState.Draft}
          onClick={() => {
            setIsDeleting(true);
            api
              .post(deleteService(), {
                id: selectedService?.serviceId,
                type: selectedService?.type,
              })
              .then(() => {
                navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
                useServiceStore.getState().resetState();
                setIsDeleting(false);
              })
              .catch((error) => {
                setIsDeleting(false);
                console.error(error);
              });
          }}
        >
          {t("serviceFlow.apiElements.delete")}
        </Button>
        <Button
          appearance={isSaving ? "loading" : "primary"}
          onClick={async () => {
            setIsSaving(true);
            await useServiceStore.getState().onServiceSave();
            setIsSaving(false);
          }}
        >
          {t("global.save")}
        </Button>
        <Button onClick={continueOnClick} disabled={!name}>
          {t("global.continue")}
        </Button>
      </Track>
    </header>
  );
};

export default NewServiceHeader;
