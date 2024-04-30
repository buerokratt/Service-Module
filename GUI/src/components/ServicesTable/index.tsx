import { FC, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineDescription, MdOutlineEdit } from "react-icons/md";
import { IoCopyOutline } from "react-icons/io5";
import { Button, Card, Icon, Label, Modal, Tooltip, Track } from "..";
import { Service } from "../../types/service";
import { ServiceState } from "../../types/service-state";
import DataTable from "../DataTable";

import "./ServicesTable.scss";
import useStore from "store/store";
import useServiceListStore from "store/services.store";
import { ROUTES } from "resources/routes-constants";
import useToastStore from "store/toasts.store";
import "../../styles/main.scss";
import ConnectServiceToIntentModel from "pages/Integration/ConnectServiceToIntentModel";
import { Intent } from "types/Intent";
import { Trigger } from "types/Trigger";

type ServicesTableProps = {
  isCommon?: boolean;
};

const getLabelType = (serviceState: ServiceState) => {
  switch (serviceState) {
    case ServiceState.Draft:
      return "disabled";
    case ServiceState.Inactive:
      return "warning-dark";
    default:
      return "info";
  }
};

const ServicesTable: FC<ServicesTableProps> = ({ isCommon = false }) => {
  const { t } = useTranslation();
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const userInfo = useStore((state) => state.userInfo);
  const [isStatePopupVisible, setIsStatePopupVisible] = useState(false);
  const [isReadyPopupVisible, setIsReadyPopupVisible] = useState(false);
  const [isIntentConnectionPopupVisible, setIsIntentConnectionPopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [readyPopupText, setReadyPopupText] = useState("");
  const [isReadyStatusChecking, setIsReadyStatusChecking] = useState(false);
  const services = useServiceListStore((state) => state.services.filter((x) => x.isCommon === isCommon));
  const columnHelper = createColumnHelper<Service>();
  const navigate = useNavigate();
  const [selectedConnectionTrigger, setSelectedConnectionTrigger] = useState<Trigger | undefined>();

  const showStatePopup = (text: string) => {
    setPopupText(text);
    setIsStatePopupVisible(true);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("overview.service.name") ?? "",
        meta: {
          size: 530,
        },
        cell: (props) => (
          <Track align="right" justify="start">
            <label style={{ paddingRight: 3 }}>{props.cell.getValue()}</label>
            <Tooltip
              content={
                <Track isMultiline={true}>
                  <label
                    style={{
                      fontSize: "15px",
                      maxWidth: "200px",
                      maxHeight: "200px",
                      overflow: "auto",
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    {props.row.original.description ?? ""}
                  </label>
                  <Button
                    appearance="text"
                    onClick={() => {
                      navigator.clipboard.writeText(props.row.original.description ?? "");
                      useToastStore.getState().success({
                        title: t("overview.descriptionCopiedSuccessfully"),
                      });
                    }}
                    style={{ paddingLeft: "5px" }}
                  >
                    <Icon style={{ color: "black" }} icon={<IoCopyOutline />} size="small" />
                  </Button>
                </Track>
              }
            >
              <div style={{ display: "inline-flex" }}>
                <Icon icon={<MdOutlineDescription />} size="medium" />
              </div>
            </Tooltip>
          </Track>
        ),
      }),
      columnHelper.accessor("usedCount", {
        header: t("overview.service.usedCount") ?? "",
        meta: {
          size: 320,
        },
      }),
      columnHelper.accessor("state", {
        header: t("overview.service.state") ?? "",
        meta: {
          size: 120,
        },
        cell: (props) => (
          <Track
            justify="around"
            onClick={() => {
              useServiceListStore.getState().setSelectedService(props.row.original);
              if (props.row.original.state === ServiceState.Ready) {
                checkIntentConnection();
                setIsReadyStatusChecking(true);
                setIsReadyPopupVisible(true);
              } else {
                showStatePopup(getStatePopupContent(props.row.original.state));
              }
            }}
          >
            <Label type={getLabelType(props.row.original.state)}>
              {t(`overview.service.states.${props.row.original.state}`)}
            </Label>
          </Track>
        ),
      }),
      columnHelper.accessor("linkedIntent", {
        header: t("overview.service.linkedIntent") ?? "",
        meta: {
          size: 200,
        },
        cell: (props) => (
          <Track justify="center">
            <label style={{ paddingRight: 40 }}>{props.cell.getValue()}</label>
          </Track>
        ),
      }),
      columnHelper.display({
        id: "edit",
        meta: {
          size: 90,
        },
        cell: (props) => (
          <Track align="right" justify="start">
            <Button
              appearance="text"
              disabled={
                isCommon === true && !userInfo?.authorities.includes("ROLE_ADMINISTRATOR")
                  ? true
                  : props.row.original.state === ServiceState.Active || props.row.original.state === ServiceState.Ready
              }
              onClick={() => navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, props.row.original.serviceId))}
            >
              <Icon icon={<MdOutlineEdit />} size="medium" />
              {t("overview.edit")}
            </Button>
          </Track>
        ),
      }),
      columnHelper.display({
        id: "delete",
        meta: {
          size: 90,
        },
        cell: (props) => (
          <Track align="right">
            <Button
              disabled={
                isCommon === true && !userInfo?.authorities.includes("ROLE_ADMINISTRATOR")
                  ? true
                  : props.row.original.state === ServiceState.Active || props.row.original.state === ServiceState.Ready
              }
              appearance="text"
              onClick={() => {
                useServiceListStore.getState().setSelectedService(props.row.original);
                setIsDeletePopupVisible(true);
              }}
            >
              <Icon icon={<MdDeleteOutline />} size="medium" />
              {t("overview.delete")}
            </Button>
          </Track>
        ),
      }),
    ],
    []
  );

  const checkIntentConnection = () => {
    useServiceListStore.getState().checkServiceIntentConnection(
      (response) => {
        setSelectedConnectionTrigger(response);
        setIsReadyStatusChecking(false);
        if (response.status === "pending") {
          setReadyPopupText(t("overview.popup.connectionPending").toString());
        } else {
          setReadyPopupText(t("overview.popup.setActive").toString());
        }
      },
      () => {
        setIsReadyStatusChecking(false);
        setReadyPopupText(t("overview.popup.intentNotConnected").toString());
      }
    );
  };

  const changeServiceState = (activate: boolean = false, draft: boolean = false) => {
    useServiceListStore.getState().changeServiceState(
      () => {
        setIsReadyPopupVisible(false);
        setIsStatePopupVisible(false);
      },
      t("overview.service.toast.updated"),
      t("overview.service.toast.failed.state"),
      activate,
      draft
    );
  };

  const deleteSelectedService = () => {
    useServiceListStore
      .getState()
      .deleteSelectedService(
        () => setIsDeletePopupVisible(false),
        t("overview.service.toast.deleted"),
        t("overview.service.toast.failed.delete")
      );
  };

  const requestServiceIntentConnection = (intent: string) => {
    useServiceListStore
      .getState()
      .requestServiceIntentConnection(
        () => setIsIntentConnectionPopupVisible(false),
        t("overview.service.toast.requestedConnection"),
        t("overview.service.toast.failed.requestConnection"),
        intent
      );
  };

  const cancelConnectionRequest = () => {
    if (selectedConnectionTrigger) {
      useServiceListStore
        .getState()
        .cancelConnectionRequest(
          () => setIsReadyPopupVisible(false),
          t("overview.service.toast.cancelledConnection"),
          t("overview.service.toast.failed.cancelledConnection"),
          selectedConnectionTrigger
        );
    }
  };

  const getChangeServiceStateButtonTitle = () => {
    if(popupText === t("overview.popup.setInactive"))
      return t("overview.popup.deactivate");
    if(popupText === t("overview.popup.setReady"))
      return t("overview.popup.setState");
    return t("overview.popup.activate");
  }

  const getStatePopupContent = (state: ServiceState) => {
    if(state === ServiceState.Draft)
      return t("overview.popup.setReady");
    if(state === ServiceState.Active)
      return t("overview.popup.setInactive");
    return t("overview.popup.setActive");
  }

  const getActiveAndConnectionButton = () => {
    if(readyPopupText === t("overview.popup.setActive")) {
      return <Button onClick={() => changeServiceState(true)}>{t("overview.popup.activateService")}</Button>
    }
    if(readyPopupText === t("overview.popup.connectionPending")) {
      return <Button onClick={cancelConnectionRequest}>{t("overview.popup.cancelRequest")}</Button>
    }
    return (
      <Button
        onClick={() => {
          setIsReadyPopupVisible(false);
          setIsIntentConnectionPopupVisible(true);
        }}
      >
        {t("overview.popup.connectToIntent")}
      </Button>
    )
  }

  return (
    <Card>
      {isDeletePopupVisible && (
        <Modal title={t("overview.popup.delete")} onClose={() => setIsDeletePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsDeletePopupVisible(false)}>
              {t("overview.cancel")}
            </Button>
            <Button appearance="error" onClick={deleteSelectedService}>
              {t("overview.delete")}
            </Button>
          </Track>
        </Modal>
      )}
      {isStatePopupVisible && (
        <Modal title={popupText} onClose={() => setIsStatePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsStatePopupVisible(false)}>
              {t("overview.cancel")}
            </Button>
            {popupText === t("overview.popup.setInactive") && (
              <Button onClick={() => changeServiceState(false, true)}>{t("overview.popup.setToDraft")}</Button>
            )}
            <Button onClick={() => changeServiceState()}>
              {getChangeServiceStateButtonTitle()}
            </Button>
          </Track>
        </Modal>
      )}
      {isReadyPopupVisible && (
        <Modal title={isReadyStatusChecking ? null : readyPopupText} onClose={() => setIsReadyPopupVisible(false)}>
          {isReadyStatusChecking ? (
            <Track justify="center" gap={16} direction="vertical">
              <label>{t("overview.popup.checking")}</label>
              <div className="loader" />
            </Track>
          ) : (
            <Track justify="end" gap={16}>
              <Button appearance="secondary" onClick={() => setIsReadyPopupVisible(false)}>
                {t("overview.cancel")}
              </Button>
              {readyPopupText != t("overview.popup.connectionPending").toString() && (
                <Button onClick={() => changeServiceState()}>{t("overview.popup.setToDraft")}</Button>
              )}
              {getActiveAndConnectionButton()}
            </Track>
          )}
        </Modal>
      )}
      {isIntentConnectionPopupVisible && (
        <ConnectServiceToIntentModel
          onModalClose={() => setIsIntentConnectionPopupVisible(false)}
          onConnect={(intent: Intent) => requestServiceIntentConnection(intent.intent)}
        />
      )}
      <DataTable sortable data={services} columns={columns} />
    </Card>
  );
};

export default ServicesTable;
