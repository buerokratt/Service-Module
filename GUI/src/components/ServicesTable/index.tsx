import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Button, Card, Icon, Label, Modal, Track } from "..";
import { Service } from "../../types/service";
import { ServiceState } from "../../types/service-state";
import DataTable from "../DataTable";

import "./ServicesTable.scss";

type Props = {
  dataSource: Service[];
};

const ServicesTable = (props: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [isDeletePopupVisible, setDeletePopupVisible] = useState(false);
  const [isStatePopupVisible, setStatePopupVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const columnHelper = createColumnHelper<Service>();

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
          onClick={() =>
            showStatePopup(
              t(
                props.row.original.state === ServiceState.Active
                  ? "overview.popup.setInactive"
                  : "overview.popup.setActive"
              )
            )
          }
        >
          <Label
            type={
              props.row.original.state === ServiceState.Active
                ? "success"
                : "error"
            }
            tooltip={<></>}
          >
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
            onClick={() => setDeletePopupVisible(true)}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      ),
    }),
  ];

  return (
    <Card>
      {isDeletePopupVisible && (
        <Modal
          title={t("overview.popup.delete")}
          onClose={() => setDeletePopupVisible(false)}
        >
          <Track justify="end" gap={16}>
            <Button
              appearance="secondary"
              onClick={() => setDeletePopupVisible(false)}
            >
              {t("overview.cancel")}
            </Button>
            <Button
              appearance="error"
              onClick={() => setDeletePopupVisible(false)}
            >
              {t("overview.delete")}
            </Button>
          </Track>
        </Modal>
      )}
      {isStatePopupVisible && (
        <Modal title={popupText} onClose={() => setStatePopupVisible(false)}>
          <Track justify="end" gap={16}>
            <Button
              appearance="secondary"
              onClick={() => setStatePopupVisible(false)}
            >
              {t("overview.cancel")}
            </Button>
            <Button onClick={() => setStatePopupVisible(false)}>
              {t("overview.popup.setState")}
            </Button>
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
