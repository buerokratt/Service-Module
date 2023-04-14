import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { Button, FormInput, FormSelect, Icon, Track } from "../../..";
import * as Tabs from "@radix-ui/react-tabs";
import DataTable from "../../../DataTable";
import { dummyVariableOptions } from "../../../../resources/api-constants";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { Option } from "../../../../types/option";

type RowData = {
  id: string;
  variable?: string;
  value?: string;
};

type TableColumns = {
  variable: string;
  value: any;
};

const EndpointCustom: React.FC = () => {
  const { t } = useTranslation();
  const tabs = ["params", "headers", "body"];
  const [error, setError] = useState<string | null>();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const [endpoint, setEndpoint] = useState<string>("");
  const [showTable, setShowTable] = useState<boolean>(false);
  const [tableKey, setTableKey] = useState<number>(0);
  const columnHelper = createColumnHelper<TableColumns>();

  const getInitialRowsData = () => {
    const data: { [tab: string]: RowData[] } = {};
    tabs.forEach((tab) => {
      data[tab] = [{ id: "0" }];
    });
    return data;
  };
  const [rowsData, setRowsData] = useState<{ [tab: string]: RowData[] }>(
    getInitialRowsData()
  );

  const getTabTriggerClasses = (tab: string) =>
    `endpoint-tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  const updateSelection = (id: string, selection: Option | null) => {
    if (!selection) return;
    rowsData[selectedTab].map((row) => {
      if (row.id !== id) return row;
      row.value = selection.value;
      return row;
    });
  };

  const addNewRow = (id: string) => {
    if (id !== `${rowsData[selectedTab].length - 1}`) return;
    setRowsData((prevRowsData) => {
      prevRowsData[selectedTab].push({ id: `${rowsData[selectedTab].length}` });
      setTableKey((key) => key + 1);
      return prevRowsData;
    });
  };

  const sortRows = (
    rowA: Row<TableColumns>,
    rowB: Row<TableColumns>,
    type: "variable" | "value"
  ): number => {
    console.log(rowA, rowB);
    const valueA = rowsData[selectedTab].find((row) => row.id === rowA.id);
    const valueB = rowsData[selectedTab].find((row) => row.id === rowB.id);
    if (type === "variable") {
      return (valueA?.variable ?? "") < (valueB?.variable ?? "") ? 1 : -1;
    }
    return (valueA?.value ?? "") < (valueB?.value ?? "") ? 1 : -1;
  };

  const columns = [
    columnHelper.accessor("variable", {
      header: t("newService.endpoint.variable") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: Row<TableColumns>, rowB: Row<TableColumns>) =>
        sortRows(rowA, rowB, "variable"),
      cell: (props) => {
        return (
          <FormInput
            style={{ borderRadius: "0 4px 4px 0" }}
            name={`endpoint-variable-${props.row.id}`}
            label=""
            onChange={(event) => {
              setRowsData((prevRowsData) => {
                prevRowsData[selectedTab].map((row) => {
                  if (row.id !== props.row.id) return row;
                  row.variable = event.target.value;
                  return row;
                });
                return prevRowsData;
              });
              addNewRow(props.row.id);
            }}
            autoFocus={props.row.id === `${rowsData[selectedTab].length - 2}`}
            defaultValue={
              rowsData[selectedTab].find((row) => row.id === props.row.id)
                ?.variable
            }
            placeholder={t("newService.endpoint.variable") + ".."}
          />
        );
      },
    }),
    columnHelper.accessor("value", {
      header: t("newService.endpoint.value") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: Row<TableColumns>, rowB: Row<TableColumns>) =>
        sortRows(rowA, rowB, "value"),
      cell: (props) => {
        return (
          <FormSelect
            name={props.row.original.variable}
            label={""}
            options={dummyVariableOptions}
            defaultValue={
              rowsData[selectedTab].find((row) => row.id === props.row.id)
                ?.value
            }
            onSelectionChange={(selection) =>
              updateSelection(props.row.id, selection)
            }
          />
        );
      },
    }),
  ];

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="endpointUrl">{t("newService.endpoint.url")}</label>
        <Track gap={8}>
          <Track style={{ width: "100%" }}>
            <div style={{ width: 108 }}>
              <FormSelect
                name={"request-type"}
                label={""}
                style={{ borderRadius: "4px 0 0 4px", borderRight: 0 }}
                options={[
                  { label: "GET", value: "GET" },
                  { label: "POST", value: "POST" },
                ]}
                defaultValue="GET"
              />
            </div>
            <FormInput
              style={{ borderRadius: "0 4px 4px 0" }}
              name="endpointUrl"
              label=""
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button
            onClick={() => {
              const errorMsg = endpoint
                ? undefined
                : t("newService.endpoint.error");
              setShowTable(!errorMsg);
              setError(errorMsg);
            }}
          >
            {t("newService.test")}
          </Button>
        </Track>
      </div>
      {error && (
        <div
          className={"toast toast--error"}
          style={{ padding: "8px 16px 8px 16px" }}
        >
          <div className="toast__title">
            <Icon icon={<MdErrorOutline />} />
            {error}
          </div>
        </div>
      )}
      {showTable && (
        <Tabs.Root
          defaultValue={selectedTab}
          onValueChange={(value) => setSelectedTab(value)}
          className="endpoint-tab-group"
        >
          <Tabs.List
            className="endpoint-tab-group__list"
            aria-label="environment"
          >
            {tabs.map((tab) => (
              <Tabs.Trigger
                className={getTabTriggerClasses(tab)}
                value={tab}
                key={tab}
              >
                {t(`newService.endpoint.${tab}`)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Content
              className="endpoint-tab-group__tab-content"
              value={tab}
              key={tab}
            >
              <DataTable
                sortable={true}
                data={rowsData[tab]}
                columns={columns}
                key={tableKey}
              />
              <hr style={{ margin: 0, borderTop: "1px solid #D2D3D8" }} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </Track>
  );
};

export default EndpointCustom;
