import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { Button, Card, Icon, Label, Track } from "..";
import { Service } from "../../types/service";
import { ServiceStatus } from "../../types/service-status";
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
  const columnHelper = createColumnHelper<Service>();

  useEffect(() => {
    const fetchServices = async () => setServices(props.dataSource);

    fetchServices().catch(console.error);
  }, [props.dataSource]);

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
        <Track justify="around">
          <Label
            type={props.row.original.state === "active" ? "success" : "error"}
            tooltip={<></>}
          >
            {t(`overview.service.status.${props.row.original.state}`)}
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
      id: "remove",
      meta: {
        size: 90,
      },
      cell: (props) => (
        <Track align="right">
          <Button disabled={props.row.original.state === ServiceStatus.Active} appearance="text">
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      ),
    }),
  ];

  return (
    <Card>
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
