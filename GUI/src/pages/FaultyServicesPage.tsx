import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, DataTable, Icon, Track } from "../components";
import { PaginationState, Row, SortingState, createColumnHelper } from "@tanstack/react-table";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Popup from "../components/Popup";
import axios from "axios";
import { getFaultyServices } from "../resources/api-constants";
import { format } from "date-fns";
import i18n from "i18n";
import withAuthorization, { ROLES } from "hoc/with-authorization";

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
  const [pageCount, setPageCount] = useState<number>(0);
  const columns = useMemo(() => getColumns(setViewFaultyServiceLog), []);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const loadFaultyServices = (pagination: PaginationState, sorting: SortingState) => {
    let sort = "dslName.keyword";
    let order = "desc";

    if (sorting.length > 0) {
      switch (sorting[0].id) {
        case "serviceMethod":
          sort = "dslMethod.keyword";
          break;
        case "errorCode":
          sort = "errorCode";
          break;
        case "stepName":
          sort = "stepName.keyword";
          break;
        case "timestamp":
          sort = "timestamp";
          break;
        default:
          sort = "dslName.keyword";
          break;
      }
      order = sorting[0].desc ? "desc" : "asc";
    }
    axios
      .get(getFaultyServices(pagination.pageIndex + 1, pagination.pageSize, sort, order))
      .then((res) => {
        setData(res.data[0]);
        setPageCount(Math.ceil(res.data[1] / pagination.pageSize));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadFaultyServices(pagination, sorting);
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
              return <p key={value}>{value}</p>;
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
                return <p key={value}>{value}</p>;
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
                return <p key={value}>{value}</p>;
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
            sorting={sorting}
            pagination={pagination}
            setPagination={(state: PaginationState) => {
              if (state.pageIndex === pagination.pageIndex && state.pageSize === pagination.pageSize) return;
              setPagination(state);
              loadFaultyServices(state, sorting);
            }}
            setSorting={(state: SortingState) => {
              setSorting(state);
              loadFaultyServices(pagination, state);
            }}
            isClientSide={false}
            pagesCount={pageCount}
          />
        </Card>
      </Track>
    </>
  );
};

const getColumns = (setViewFaultyServiceLog: (data: FaultyService) => void) => {
  const columnHelper = createColumnHelper<FaultyService>();

  return [
    columnHelper.accessor("service", {
      header: i18n.t("logs.service") ?? "",
      cell: (props) => <span>{props.getValue().split("/").pop()}</span>,
    }),
    columnHelper.accessor("serviceMethod", {
      header: i18n.t("logs.method") ?? "",
    }),
    columnHelper.accessor("errorCode", {
      header: i18n.t("logs.errorCode") ?? "",
    }),
    columnHelper.accessor("stepName", {
      header: i18n.t("logs.failedStep") ?? "",
    }),
    columnHelper.accessor("timestamp", {
      header: i18n.t("logs.failedTime") ?? "",
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
            {i18n.t("logs.view")}
          </Button>
        </Track>
      ),
    }),
  ];
};

export default withAuthorization(FaultyServicesPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
