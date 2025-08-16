import React, { FC, useState } from "react";
import { t } from "i18next";
import { Button, HeaderStepCounter, Modal, Track } from "..";
import useServiceStore from "store/new-services.store";
import "@buerokratt-ria/header/src/Header.scss";
import { ROUTES } from "resources/routes-constants";
import { useNavigate, useParams } from "react-router-dom";
import useServiceListStore from "../../store/services.store";
import { ServiceState } from "types";
import { deleteService } from "resources/api-constants";
import api from "../../services/api-dev";
import { removeTrailingUnderscores } from "utils/string-util";
import useToastStore from "store/toasts.store";

type NewServiceHeaderProps = {
  activeStep: number;
  backOnClick: () => void;
  continueOnClick: () => void;
  saveOnClick: () => void;
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({ activeStep, backOnClick, continueOnClick, saveOnClick }) => {
  const name = removeTrailingUnderscores(useServiceStore((state) => state.serviceNameDashed()));
  const serviceState = useServiceStore((state) => state.serviceState);
  const selectedService = useServiceListStore((state) => state.selectedService);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isDeleteServiceModalVisible, setIsDeleteServiceModalVisible] = useState(false);
  const { id } = useParams();

  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <Button appearance="text" style={{ textDecoration: "none", boxShadow: "none" }} onClick={backOnClick}>
            <h1 style={{ whiteSpace: "nowrap", color: "black" }}>{`< ${t("menu.backToServiceListing")}`}</h1>
          </Button>
          <HeaderStepCounter activeStep={activeStep} />
          <Button
            appearance={isDeleting ? "loading" : "error"}
            disabled={
              serviceState && id ? serviceState !== ServiceState.Draft && serviceState !== ServiceState.Ready : true
            }
            onClick={() => {
              setIsDeleteServiceModalVisible(true);
            }}
          >
            {t("serviceFlow.apiElements.delete")}
          </Button>
          <Button
            appearance={isSaving ? "loading" : "primary"}
            onClick={async () => {
              setIsSaving(true);
              await useServiceStore.getState().onServiceSave(ServiceState.Draft);
              setIsSaving(false);
              saveOnClick();
            }}
          >
            {t("global.save")}
          </Button>
          <Button
            appearance={isContinuing ? "loading" : "primary"}
            onClick={() => {
              if (isSaving) {
                useToastStore.getState().info({ title: t("overview.service.toast.cannotContinueUntilServiceIsSaved") });
                return;
              }
              setIsContinuing(true);
              useServiceStore
                .getState()
                .onContinueClick()
                .then(() => {
                  setIsContinuing(false);
                  continueOnClick();
                })
                .catch((error) => {
                  setIsContinuing(false);
                  console.error(error);
                });
            }}
            disabled={!name}
          >
            {t("global.confirm")}
          </Button>
        </Track>
      </header>
      {isDeleteServiceModalVisible && (
        <Modal title={t("overview.popup.delete")} onClose={() => setIsDeleteServiceModalVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsDeleteServiceModalVisible(false)}>
              {t("overview.cancel")}
            </Button>
            <Button
              appearance="error"
              onClick={() => {
                setIsDeleteServiceModalVisible(false);
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
              {t("overview.delete")}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default NewServiceHeader;
