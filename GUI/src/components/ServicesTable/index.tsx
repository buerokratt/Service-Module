import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Button, Card, Icon, Label, Modal, Track } from "..";
import { changeServiceStatus, deleteService } from "../../resources/api-constants";
import { Service } from "../../types/service";
import { ServiceState } from "../../types/service-state";
import DataTable from "../DataTable";

import "./ServicesTable.scss";
import axios from "axios";
import useStore from "store/store";
import useServiceListStore from "store/services.store";
import useToastStore from "store/toasts.store";

type ServicesTableProps = {
  isCommon?: boolean;
};

const ServicesTable: FC<ServicesTableProps> = ({ isCommon = false }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { t } = useTranslation();
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const userInfo = useStore((state) => state.userInfo);
  const [isStatePopupVisible, setStatePopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const columnHelper = createColumnHelper<Service>();
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const services = useServiceListStore((state) => state.services.filter(x => x.isCommon === isCommon));

  const showStatePopup = (text: string) => {
    setPopupText(text);
    setStatePopupVisible(true);
  };

  const columns = [
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
            setSelectedService(props.row.original);
          }}
        >
          <Label type={setLabelType(props.row.original.state)}>
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
      cell: (_) => (
        <Track align="right" justify="start">
          <Button
            appearance="text"
            disabled={isCommon === true && !userInfo?.authorities.includes("ROLE_ADMINISTRATOR") ? true : false}
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
              setSelectedService(services.find((s) => s.id === props.row.original.id));
              setDeletePopupVisible(true);
            }}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      ),
    }),
  ];

  const setLabelType = (serviceState: ServiceState) => {
    switch (serviceState) {
      case ServiceState.Draft:
        return "disabled";
      case ServiceState.Inactive:
        return "warning-dark";
      default:
        return "info";
    }
  };

  const changeServiceState = async () => {
    if (!selectedService) return;

    try {
      await axios.post(changeServiceStatus(), {
        id: selectedService.id,
        state: selectedService.state === ServiceState.Active ? ServiceState.Inactive : ServiceState.Active,
        type: selectedService.type,
      });
      useToastStore.getState().success({
        title: t("overview.service.toast.updated"),
      });
      await useServiceListStore.getState().loadServicesList();
    } catch (_) {
      useToastStore.getState().error({
        title: t("overview.service.toast.failed.state"),
      });
    }
    setSelectedService(undefined);
    setStatePopupVisible(false);
  };

  const deleteSelectedService = async () => {
    if (!selectedService) return;

    try {
      await axios.post(deleteService(), {
        id: selectedService?.id,
        type: selectedService?.type,
      });
      useToastStore.getState().success({
        title: t("overview.service.toast.deleted"),
      });
      await useServiceListStore.getState().deleteService(selectedService.id);
    } catch (_) {
      useToastStore.getState().error({
        title: t("overview.service.toast.failed.delete"),
      });
    }
    setSelectedService(undefined);
    setDeletePopupVisible(false);
  };

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
        pagination={pagination}
        setPagination={setPagination}
      />
    </Card>
  );
};

export default ServicesTable;
