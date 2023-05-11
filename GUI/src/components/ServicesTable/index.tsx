import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Button, Card, Icon, Label, Modal, Track } from "..";
import { changeServiceStatus, deleteService } from "../../resources/api-constants";
import { Service } from "../../types/service";
import { ServiceState } from "../../types/service-state";
import DataTable from "../DataTable";

import "./ServicesTable.scss";
import axios from "axios";
import { ToastContext } from "../Toast/ToastContext";

type Props = {
  dataSource: Service[];
  onServiceUpadeCallback: () => Promise<void>;
};

const ServicesTable = (props: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { t } = useTranslation();
  const toast = useContext(ToastContext);
  const [services, setServices] = useState<Service[]>([]);
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const [isStatePopupVisible, setStatePopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const columnHelper = createColumnHelper<Service>();
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  useEffect(() => {
    setServices(props.dataSource);
  }, [props.dataSource]);

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
          <Button appearance="text">
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
            disabled={props.row.original.state === ServiceState.Active}
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
      toast.open({
        type: "success",
        title: t("overview.service.toast.updated"),
        message: "",
      });
      await props.onServiceUpadeCallback();
    } catch (_) {
      toast.open({
        type: "error",
        title: t("overview.service.toast.failed.state"),
        message: "",
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
      toast.open({
        type: "success",
        title: t("overview.service.toast.deleted"),
        message: "",
      });
      setServices((prevServices) => prevServices.filter((s) => s.id !== selectedService?.id));
    } catch (_) {
      toast.open({
        type: "error",
        title: t("overview.service.toast.failed.delete"),
        message: "",
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
