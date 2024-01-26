import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, DataTable, Icon, Track } from "../components";
import { PaginationState, Row, createColumnHelper } from "@tanstack/react-table";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Popup from "../components/Popup";
import axios from "axios";
import { getFaultyServices } from "../resources/api-constants";
import { format } from "date-fns";

interface FaultyService {
  id: string;
  service: string;
  serviceMethod: string;
  errorCode: number;
  message: string;
  timestamp: string;
  stepName: string;
  requestHeaders: string[];
  requestBody: string[];
  requestParams: string[];
}

const FaultyServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [viewFaultyServiceLog, setViewFaultyServiceLog] = useState<FaultyService | null>(null);
  const [data, setData] = useState<FaultyService[]>([]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<FaultyService>();

    return [
      columnHelper.accessor("service", {
        header: t("logs.service") ?? "",
        cell: (props) => <span>{props.getValue().split("/").pop()}</span>,
      }),
      columnHelper.accessor("serviceMethod", {
        header: t("logs.method") ?? "",
      }),
      columnHelper.accessor("errorCode", {
        header: t("logs.errorCode") ?? "",
      }),
      columnHelper.accessor("stepName", {
        header: t("logs.failedStep") ?? "",
      }),
      columnHelper.accessor("timestamp", {
        header: t("logs.failedTime") ?? "",
        cell: (props) => <span>{format(new Date(parseInt(props.getValue() ?? "0")), "dd-MM-yyyy HH:mm:ss")}</span>,
        filterFn: (row: Row<FaultyService>, _, filterValue) => {
          return format(new Date(parseInt(row.original.timestamp ?? "0")), "dd-MM-yyyy HH:mm:ss")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        },
      }),
      columnHelper.display({
        id: "view",
        meta: {
          size: 90,
        },
        cell: (props) => (
          <Track align="right" justify="start">
            <Button appearance="text" onClick={() => setViewFaultyServiceLog(props.row.original)}>
              <Icon icon={<MdOutlineRemoveRedEye />} size="medium" />
              {t("logs.view")}
            </Button>
          </Track>
        ),
      }),
    ];
  }, []);

  useEffect(() => {
    axios.get(getFaultyServices()).then((res) => setData(res.data));
  }, []);

  return (
    <>
      {viewFaultyServiceLog && (
        <Popup
          title={`${t("logs.log")}: ${viewFaultyServiceLog.service.split("/").pop()}`}
          onClose={() => setViewFaultyServiceLog(null)}
          footer={
            <Button appearance="secondary" onClick={() => setViewFaultyServiceLog(null)}>
              {t("global.close")}
            </Button>
          }
        >
          <h3>{t("logs.errorMessage")}</h3>
          <Track
            direction="vertical"
            align="left"
            style={{
              padding: "1rem",
              background: "#f0f0f2",
              borderRadius: ".2rem",
              color: "#4e4f5d",
            }}
          >
            {viewFaultyServiceLog.message ? viewFaultyServiceLog.message : t("logs.noErrorMessage")}
          </Track>

          <h3 style={{ paddingTop: 10 }}>{t("logs.headers")}</h3>
          <Track
            direction="vertical"
            align="left"
            style={{
              padding: "1rem",
              background: "#f0f0f2",
              borderRadius: ".2rem",
              color: "#4e4f5d",
            }}
          >
            {viewFaultyServiceLog.requestHeaders.map((value) => {
              return <p>{value}</p>;
            })}
          </Track>
          {viewFaultyServiceLog.serviceMethod === "GET" && viewFaultyServiceLog.requestParams.length > 0 && (
            <h3 style={{ paddingTop: 10 }}>{t("logs.parameters")}</h3>
          )}
          {viewFaultyServiceLog.serviceMethod === "GET" && viewFaultyServiceLog.requestParams.length > 0 && (
            <Track
              direction="vertical"
              align="left"
              style={{
                padding: "1rem",
                background: "#f0f0f2",
                borderRadius: ".2rem",
                color: "#4e4f5d",
              }}
            >
              {viewFaultyServiceLog.requestParams.map((value) => {
                return <p>{value}</p>;
              })}
            </Track>
          )}
          {viewFaultyServiceLog.serviceMethod === "POST" && viewFaultyServiceLog.requestBody.length > 0 && (
            <h3 style={{ paddingTop: 10 }}>{t("logs.body")}</h3>
          )}
          {viewFaultyServiceLog.serviceMethod === "POST" && viewFaultyServiceLog.requestBody.length > 0 && (
            <Track
              direction="vertical"
              align="left"
              style={{
                padding: "1rem",
                background: "#f0f0f2",
                borderRadius: ".2rem",
                color: "#4e4f5d",
              }}
            >
              {viewFaultyServiceLog.requestBody.map((value) => {
                return <p>{value}</p>;
              })}
            </Track>
          )}
        </Popup>
      )}

      <Track direction="vertical" align="stretch">
        <h1>{t("menu.faultyServices")}</h1>
        <Card>
          <DataTable
            sortable
            filterable
            data={data}
            columns={columns}
          />
        </Card>
      </Track>
    </>
  );
};

export default FaultyServicesPage;
