import { Button, Icon, Track } from "@buerokratt-ria/header/src/components";
import { createColumnHelper } from "@tanstack/react-table";
import Label from "components/Label";
import Tooltip from "components/Tooltip";
import i18n from "i18n";
import { IoCopyOutline } from "react-icons/io5";
import { MdDeleteOutline, MdOutlineArrowForward, MdOutlineDescription, MdOutlineEdit } from "react-icons/md";
import { NavigateFunction } from "react-router-dom";
import { ROUTES } from "resources/routes-constants";
import useServiceListStore from "store/services.store";
import useStore from "store/store";
import useToastStore from "store/toasts.store";
import { Service, ServiceState } from "types";

interface GetColumnsConfig {
  isCommon: boolean;
  navigate: NavigateFunction;
  checkIntentConnection: () => void;
  hideDeletePopup: () => void;
  showStatePopup: (text: string) => void;
  showReadyPopup: () => void;
  showIntentConnectionModal: () => void;
  editService: () => void;
}

export const getColumns = ({
  isCommon,
  navigate,
  checkIntentConnection,
  hideDeletePopup,
  showStatePopup,
  showReadyPopup,
  showIntentConnectionModal,
  editService,
}: GetColumnsConfig) => {
  const columnHelper = createColumnHelper<Service>();
  const userInfo = useStore.getState().userInfo;

  return [
    columnHelper.accessor("name", {
      header: i18n.t("overview.service.name") ?? "",
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
                      title: i18n.t("overview.descriptionCopiedSuccessfully"),
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
      header: i18n.t("overview.service.usedCount") ?? "",
      meta: {
        size: 320,
      },
    }),
    columnHelper.accessor("linkedIntent", {
      header: i18n.t("overview.service.linkedIntent") ?? "",
      meta: {
        size: 200,
      },
      cell: (props) => (
        <Track justify="start">
          {props.cell.getValue() ? (
            <Button
              style={{
                textDecoration: props.row.original.state === ServiceState.Ready ? undefined : "none",
                boxShadow: "none",
              }}
              appearance="text"
              onClick={() => (props.row.original.state === ServiceState.Ready ? showIntentConnectionModal() : {})}
            >
              <label style={{ paddingLeft: "15px", color: "black" }}>{props.cell.getValue()}</label>
            </Button>
          ) : (
            <Button
              appearance="text"
              onClick={() => showIntentConnectionModal()}
              disabled={props.row.original.state === ServiceState.Draft}
            >
              <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
              {i18n.t("overview.popup.connectToIntent")}
            </Button>
          )}
        </Track>
      ),
    }),
    columnHelper.accessor("state", {
      header: i18n.t("overview.service.state") ?? "",
      meta: {
        size: 120,
      },
      cell: (props) => (
        <Track
          justify="around"
          onClick={() => {
            useServiceListStore.getState().setSelectedService(props.row.original);
            const state = props.row.original.state;
            if (state === ServiceState.Ready && props.row.original.linkedIntent != "") {
              checkIntentConnection();
              showReadyPopup();
            }
          }}
        >
          <Label type={getLabelType(props.row.original.state)}>
            {i18n.t(`overview.service.states.${props.row.original.state}`)}
          </Label>
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
            onClick={() => {
              useServiceListStore.getState().setSelectedService(props.row.original);
              if (props.row.original.state != ServiceState.Draft) {
                editService();
              }
              navigate(ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, props.row.original.serviceId));
            }}
          >
            <Icon icon={<MdOutlineEdit />} size="medium" />
            {i18n.t("overview.edit")}
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
              hideDeletePopup();
            }}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {i18n.t("overview.delete")}
          </Button>
        </Track>
      ),
    }),
  ];
};

const getLabelType = (serviceState: ServiceState) => {
  switch (serviceState) {
    case ServiceState.Ready:
      return "warning-dark";
    case ServiceState.Active:
      return "success-light";
    case ServiceState.Draft:
      return "disabled";
    case ServiceState.Inactive:
      return "warning-dark";
    default:
      return "info";
  }
};

const getStatePopupContent = (state: ServiceState) => {
  if (state === ServiceState.Draft) return i18n.t("overview.popup.setReady");
  if (state === ServiceState.Active) return i18n.t("overview.popup.setInactive");
  return i18n.t("overview.popup.setActive");
};
