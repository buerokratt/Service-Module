import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  FormInput,
  FormSelect,
  FormTextarea,
  SwitchBox,
  Track,
} from "../../..";
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

const RequestVariables: React.FC = () => {
  const { t } = useTranslation();
  const tabs = ["params", "headers", "body"];
  const [jsonError, setJsonError] = useState<string>();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const [showRawData, setShowRawData] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const columnHelper = createColumnHelper<TableColumns>();

  const getInitialTabsRowsData = () => {
    const data: { [tab: string]: RowData[] } = {};
    tabs.forEach((tab) => {
      data[tab] = [{ id: "0" }];
    });
    return data;
  };

  const getInitialTabsRawData = () => {
    const data: { [tab: string]: string } = {};
    tabs.forEach((tab) => {
      data[tab] = "";
    });
    return data;
  };
  const [rowsData, setRowsData] = useState<{ [tab: string]: RowData[] }>(
    getInitialTabsRowsData()
  );
  const [tabRawData, setTabRawData] = useState<{ [tab: string]: string }>(
    getInitialTabsRawData()
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
      setKey(key + 1);
      return prevRowsData;
    });
  };

  const sortRows = (
    rowA: Row<TableColumns>,
    rowB: Row<TableColumns>,
    type: "variable" | "value"
  ): number => {
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
      sortingFn: (rowA: Row<TableColumns>, rowB: Row<TableColumns>) => {
        return sortRows(rowA, rowB, "variable");
      },
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
      sortingFn: (rowA: Row<TableColumns>, rowB: Row<TableColumns>) => {
        return sortRows(rowA, rowB, "value");
      },
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

  const buildRawDataView = (): JSX.Element => {
    return (
      <>
        <Track justify="between" style={{ padding: "8px 0 8px 0" }}>
          <p style={{ color: "#d73e3e" }}>{jsonError}</p>
          <Button
            appearance="text"
            onClick={() => {
              setTabRawData((prevRawData) => {
                try {
                  prevRawData[selectedTab] = JSON.stringify(
                    JSON.parse(prevRawData[selectedTab]),
                    null,
                    4
                  );
                } catch (e: any) {
                  setJsonError(`Unable to format JSON. ${e.message}`);
                }
                return prevRawData;
              });
              setKey(key + 1);
            }}
          >
            Format JSON
          </Button>
        </Track>
        <FormTextarea
          key={`${selectedTab}-raw-data`}
          name={`${selectedTab}-raw-data`}
          label={""}
          defaultValue={tabRawData[selectedTab]}
          onChange={(event) => {
            setJsonError(undefined);
            setTabRawData((prevRawData) => {
              prevRawData[selectedTab] = event.target.value;
              return prevRawData;
            });
          }}
        />
      </>
    );
  };

  return (
    <Tabs.Root
      defaultValue={selectedTab}
      onValueChange={(value) => setSelectedTab(value)}
      className="endpoint-tab-group"
      key={key}
    >
      <Track justify="between" style={{ borderBottom: "solid 1px #5d6071" }}>
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
        <Track style={{ paddingRight: 16 }} gap={8}>
          <SwitchBox
            style={{ width: "fit-content" }}
            label={""}
            name={"raw-data"}
            checked={showRawData}
            onCheckedChange={(checked) => setShowRawData(checked)}
          />
          <p style={{ whiteSpace: "nowrap", color: "#34394C" }}>Raw data</p>
        </Track>
      </Track>
      {tabs.map((tab) => (
        <Tabs.Content
          className="endpoint-tab-group__tab-content"
          value={tab}
          key={tab}
        >
          {showRawData ? (
            buildRawDataView()
          ) : (
            <>
              <DataTable
                sortable={true}
                data={rowsData[tab]}
                columns={columns}
              />
              <hr style={{ margin: 0, borderTop: "1px solid #D2D3D8" }} />
            </>
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default RequestVariables;
