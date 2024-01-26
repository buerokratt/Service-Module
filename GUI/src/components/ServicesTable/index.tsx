import { FC, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Button, Card, Icon, Label, Modal, Track } from "..";
import { Service } from "../../types/service";
import { ServiceState } from "../../types/service-state";
import DataTable from "../DataTable";

import "./ServicesTable.scss";
import useStore from "store/store";
import useServiceListStore from "store/services.store";
import { ROUTES } from "resources/routes-constants";

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
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const userInfo = useStore((state) => state.userInfo);
  const [isStatePopupVisible, setStatePopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const services = useServiceListStore((state) => state.services.filter(x => x.isCommon === isCommon));
  const columnHelper = createColumnHelper<Service>();
  const navigate = useNavigate();
  
  const showStatePopup = (text: string) => {
    setPopupText(text);
    setStatePopupVisible(true);
  };

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: t("overview.service.name") ?? "",
      meta: {
        size: 530,
      },
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
            showStatePopup(
              t(
                props.row.original.state === ServiceState.Active
                  ? "overview.popup.setInactive"
                  : "overview.popup.setActive"
              )
            );
            useServiceListStore.getState().setSelectedService(props.row.original);
          }}
        >
          <Label type={getLabelType(props.row.original.state)}>
            {t(`overview.service.states.${props.row.original.state}`)}
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
            disabled={
              isCommon === true && !userInfo?.authorities.includes("ROLE_ADMINISTRATOR") 
                ? true 
                : props.row.original.state === ServiceState.Active
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
                : props.row.original.state === ServiceState.Active
            }
            appearance="text"
            onClick={() => {
              useServiceListStore.getState().setSelectedService(props.row.original);
              setDeletePopupVisible(true);
            }}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      ),
    }),
  ], []);

  const changeServiceState = () => {
    useServiceListStore.getState().changeServiceState(
      () => setStatePopupVisible(false),
      t("overview.service.toast.updated"),
      t("overview.service.toast.failed.state"),
    );
  }

  const deleteSelectedService = () => {
    useServiceListStore.getState().deleteSelectedService(
      () => setDeletePopupVisible(false),
      t("overview.service.toast.deleted"),
      t("overview.service.toast.failed.delete"),
    );
  }

  return (
    <Card>
      {isDeletePopupVisible && (
        <Modal title={t("overview.popup.delete")} onClose={() => setDeletePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setDeletePopupVisible(false)}>
              {t("overview.cancel")}
            </Button>
            <Button appearance="error" onClick={deleteSelectedService}>
              {t("overview.delete")}
            </Button>
          </Track>
        </Modal>
      )}
      {isStatePopupVisible && (
        <Modal title={popupText} onClose={() => setStatePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setStatePopupVisible(false)}>
              {t("overview.cancel")}
            </Button>
            <Button onClick={changeServiceState}>{t("overview.popup.setState")}</Button>
          </Track>
        </Modal>
      )}
      <DataTable
        sortable={true}
        data={services}
        columns={columns}
      />
    </Card>
  );
};

export default ServicesTable;
