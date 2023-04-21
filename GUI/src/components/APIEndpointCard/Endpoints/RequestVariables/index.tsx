import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, FormInput, FormSelect, FormTextarea, Icon, SwitchBox, Tooltip, Track } from "../../..";
import * as Tabs from "@radix-ui/react-tabs";
import DataTable from "../../../DataTable";
import { dummyVariableOptions } from "../../../../resources/api-constants";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { Option } from "../../../../types/option";
import { MdDeleteOutline } from "react-icons/md";
import { EndpointType } from "../../../../types/endpoint-type";
import { EndpointTab } from "../../../../types/endpoint-tab.enum";
import { RequestVariablesTableColumns } from "../../../../types/request-variables-table-columns";
import { RequestVariablesTabsRowsData } from "../../../../types/request-variables-tabs-rows-data";
import { RequestVariablesTabsRawData } from "../../../../types/request-variables-tabs-raw-data";
import { EndpointRequestData } from "../../../../types/endpoint-request-data";
import { RequestVariablesRowData } from "../../../../types/request-variables-row-data";

type RequestVariablesProps = {
  disableRawData?: boolean;
  endpointData?: EndpointType;
  updateEndpointData: (data: RequestVariablesTabsRowsData, openApiEndpointId?: string) => void;
  isLive: boolean;
};

const RequestVariables: React.FC<RequestVariablesProps> = ({
  disableRawData,
  endpointData,
  updateEndpointData,
  isLive,
}) => {
  const { t } = useTranslation();
  const tabs: EndpointTab[] = [EndpointTab.Params, EndpointTab.Headers, EndpointTab.Body];
  const [jsonError, setJsonError] = useState<string>();
  const [selectedTab, setSelectedTab] = useState<EndpointTab>(tabs[0]);
  const [showRawData, setShowRawData] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const columnHelper = createColumnHelper<RequestVariablesTableColumns>();

  const constructRow = (id: number, data: EndpointRequestData, nestedLevel: number): RequestVariablesRowData => {
    return {
      id: `${id}`,
      endpointVariableId: data.id,
      required: data.required,
      variable: data.name,
      value: isLive ? data.value : data.testValue,
      isNameEditable: false,
      type: data.type,
      description: data.description,
      arrayType: data.arrayType,
      nestedLevel,
    };
  };

  const getInitialTabsRowsData = (): RequestVariablesTabsRowsData => {
    return tabs.reduce((tabsRowsData, tab) => {
      const rows: RequestVariablesRowData[] = [];
      if (endpointData) {
        if (!endpointData[tab]) return tabsRowsData;
        let rowIdx = 0;
        endpointData[tab]!.forEach((variable) => {
          rows.push(constructRow(rowIdx, variable, 0));
          if (["schema", "array"].includes(variable.type)) {
            rowIdx = getRowsFromNestedSchema(variable, rowIdx, rows, 1);
          }
          rowIdx++;
        });
      }
      if (rows.length === 0) {
        rows.push({
          id: `0`,
          required: false,
          isNameEditable: true,
          nestedLevel: 0,
        });
      }
      return { ...tabsRowsData, [tab]: rows };
    }, {});
  };

  const getRowsFromNestedSchema = (
    variable: EndpointRequestData,
    oldRowIdx: number,
    rows: RequestVariablesRowData[],
    nestedLevel: number
  ): number => {
    let rowIdx = oldRowIdx;
    const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
    if (variableData instanceof Array) {
      (variableData as EndpointRequestData[]).forEach((data) => {
        rowIdx++;
        rows.push(constructRow(rowIdx, data, nestedLevel));
        if (["schema", "array"].includes(data.type)) {
          rowIdx = getRowsFromNestedSchema(data, rowIdx, rows, nestedLevel + 1);
        }
      });
    }
    return rowIdx;
  };

  const getInitialTabsRawData = (): RequestVariablesTabsRawData => {
    return tabs.reduce((tabsRawData, tab) => {
      return { ...tabsRawData, [tab]: "" };
    }, {});
  };
  const [rowsData, setRowsData] = useState<RequestVariablesTabsRowsData>(getInitialTabsRowsData());
  const [tabRawData, setTabRawData] = useState<RequestVariablesTabsRawData>(getInitialTabsRawData());

  useEffect(() => {
    setSelectedTab(Object.keys(rowsData)[0] as EndpointTab);
    setKey(key + 1);
  }, [setRowsData]);

  const getTabTriggerClasses = (tab: EndpointTab) =>
    `endpoint-tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  const updateSelection = (id: string, selection: Option | null) => {
    if (!selection || !rowsData[selectedTab]) return;
    rowsData[selectedTab]!.map((row) => {
      if (row.id !== id) return row;
      row.value = selection.value;
      return row;
    });
    updateEndpointData(rowsData, endpointData?.id);
  };

  const addNewRow = (id: string) => {
    if (!rowsData[selectedTab] || id !== `${rowsData[selectedTab]!.length - 1}`) return;
    setRowsData((prevRowsData) => {
      prevRowsData[selectedTab]!.push({
        id: `${rowsData[selectedTab]!.length}`,
        required: false,
        isNameEditable: true,
        nestedLevel: 0,
      });
      setKey(key + 1);
      return prevRowsData;
    });
  };

  const sortRows = (
    rowA: Row<RequestVariablesTableColumns>,
    rowB: Row<RequestVariablesTableColumns>,
    type: "variable" | "value"
  ): number => {
    if (!rowsData[selectedTab]) return 1;
    const valueA = rowsData[selectedTab]!.find((row) => row.id === rowA.id);
    const valueB = rowsData[selectedTab]!.find((row) => row.id === rowB.id);
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
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, "variable");
      },
      cell: (props) => {
        const rowData = rowsData[selectedTab]![+props.row.id];
        if (!rowData) return;
        return rowData.isNameEditable ? (
          <FormInput
            style={{ borderRadius: "0 4px 4px 0" }}
            name={`endpoint-variable-${props.row.id}`}
            label=""
            onChange={(event) => {
              setRowsData((prevRowsData) => {
                prevRowsData[selectedTab]!.map((row) => {
                  if (row.id !== props.row.id) return row;
                  row.variable = event.target.value;
                  return row;
                });
                return prevRowsData;
              });
              addNewRow(props.row.id);
            }}
            autoFocus={props.row.id === `${rowsData[selectedTab]!.length - 2}`}
            defaultValue={rowsData[selectedTab]!.find((row) => row.id === props.row.id)?.variable}
            placeholder={t("newService.endpoint.variable") + ".."}
          />
        ) : (
          <p style={{ paddingLeft: 40 * rowData.nestedLevel }}>
            {rowData.variable}
            {rowData.type && `, (${rowData.type})`}
            {rowData.description && `, (${rowData.description})`}
          </p>
        );
      },
    }),
    columnHelper.accessor("value", {
      header: t("newService.endpoint.value") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, "value");
      },
      cell: (props) => {
        const rowData = rowsData[selectedTab]![+props.row.id];
        if (!rowData) return;
        return rowData.type === "schema" || (rowData.type === "array" && rowData.arrayType === "schema") ? (
          <></>
        ) : (
          <FormSelect
            name={props.row.original.variable}
            label={""}
            options={dummyVariableOptions}
            defaultValue={rowsData[selectedTab]!.find((row) => row.id === props.row.id)?.value}
            onSelectionChange={(selection) => updateSelection(props.row.id, selection)}
          />
        );
      },
    }),
    columnHelper.display({
      id: "delete",
      cell: (props) => {
        return (
          <Track justify="center" style={{ paddingRight: 8 }}>
            {props.row.original.required ? (
              <Tooltip content={t("newService.endpoint.required")}>
                <span className="variable-required">!</span>
              </Tooltip>
            ) : (
              <Button
                appearance="text"
                onClick={() => {
                  setRowsData((prevRowsData) => {
                    prevRowsData[selectedTab] = prevRowsData[selectedTab]!.filter((row) => row.id !== props.row.id).map(
                      (row, index) => {
                        return { ...row, id: `${index}` };
                      }
                    );
                    return prevRowsData;
                  });
                  setKey(key + 1);
                }}
              >
                <Icon icon={<MdDeleteOutline />} size="medium" />
              </Button>
            )}
          </Track>
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
                  prevRawData[selectedTab] = JSON.stringify(JSON.parse(prevRawData[selectedTab]!), null, 4);
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
      onValueChange={(value) => setSelectedTab(value as EndpointTab)}
      className="endpoint-tab-group"
      key={key}
    >
      <Track justify="between" style={{ borderBottom: "solid 1px #5d6071" }}>
        <Tabs.List className="endpoint-tab-group__list" aria-label="environment">
          {Object.keys(rowsData).map((tab) => {
            return (
              <Tabs.Trigger className={getTabTriggerClasses(tab as EndpointTab)} value={tab} key={tab}>
                {t(`newService.endpoint.${tab}`)}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
        {!disableRawData && (
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
        )}
      </Track>
      {Object.keys(rowsData).map((tab) => (
        <Tabs.Content className="endpoint-tab-group__tab-content" value={tab} key={tab}>
          {showRawData ? (
            buildRawDataView()
          ) : (
            <>
              <DataTable sortable={true} data={rowsData[tab as EndpointTab]} columns={columns} />
              <hr style={{ margin: 0, borderTop: "1px solid #D2D3D8" }} />
            </>
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default RequestVariables;
