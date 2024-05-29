import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaginationState, SortingState, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { Card, DataTable, Icon } from "components";
import { Trigger } from "types/Trigger";
import useServiceStore from "store/services.store";
import withAuthorization, { ROLES } from "hoc/with-authorization";

const ConnectionRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const [triggers, setTriggers] = useState<Trigger[] | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const loadConnectionRequests = () => {
    useServiceStore
      .getState()
      .loadRequestsList((requests: Trigger[]) => setTriggers(requests), t("connectionRequests.toast.failed.requests"));
  };

  useEffect(() => {
    loadConnectionRequests();
  }, []);

  const respondToConnectionRequest = (status: boolean, request: Trigger) => {
    useServiceStore
      .getState()
      .respondToConnectionRequest(
        () => loadConnectionRequests(),
        t("connectionRequests.approvedConnection"),
        t("connectionRequests.declinedConnection"),
        status,
        request
      );
  };

  const appRequestColumns = useMemo(() => getColumns(respondToConnectionRequest), []);

  if (!triggers) return <span>Loading ...</span>;

  return (
    <>
      <h1>{t("connectionRequests.title")}</h1>
      <Card>
        <DataTable
          data={triggers}
          columns={appRequestColumns}
          sortable
          sorting={sorting}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
        />
      </Card>
    </>
  );
};

const getColumns = (respondToConnectionRequest: (result: boolean, tigger: Trigger) => void) => {
  const appRequestColumnHelper = createColumnHelper<Trigger>();

  return [
    appRequestColumnHelper.accessor("intent", {
      header: "Intent",
      cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
    }),
    appRequestColumnHelper.accessor("serviceName", {
      header: "Service",
      cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
    }),
    appRequestColumnHelper.accessor("requestedAt", {
      header: "Requested At",
      cell: (props) => <span>{format(new Date(props.getValue()), "dd-MM-yyyy HH:mm:ss")}</span>,
    }),
    appRequestColumnHelper.display({
      header: "",
      cell: (props) => (
        <Icon
          icon={
            <AiFillCheckCircle
              fontSize={22}
              color="rgba(34,139,34, 1)"
              onClick={() => respondToConnectionRequest(true, props.row.original)}
            />
          }
          size="medium"
        />
      ),
      id: "approve",
      meta: {
        size: "1%",
      },
    }),
    appRequestColumnHelper.display({
      header: "",
      cell: (props) => (
        <Icon
          icon={
            <AiFillCloseCircle
              fontSize={22}
              color="rgba(210, 4, 45, 1)"
              onClick={() => respondToConnectionRequest(false, props.row.original)}
            />
          }
          size="medium"
        />
      ),
      id: "reject",
      meta: {
        size: "1%",
      },
    }),
    appRequestColumnHelper.display({
      header: "",
      id: "space",
      meta: {
        size: "1%",
      },
    }),
  ];
};

export default withAuthorization(ConnectionRequestsPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
