import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, FormTextarea, Icon, SwitchBox, Tooltip, Track, ValueCell, VariableCell } from "../../..";
import * as Tabs from "@radix-ui/react-tabs";
import DataTable from "../../../DataTable";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { MdDeleteOutline } from "react-icons/md";
import { RequestTab } from "../../../../types";
import {
  EndpointType,
  EndpointData,
  EndpointTab,
  EndpointVariableData,
  PreDefinedEndpointEnvVariables,
} from "../../../../types/endpoint";
import {
  RequestVariablesTabsRowsData,
  RequestVariablesTabsRawData,
  RequestVariablesTableColumns,
  RequestVariablesRowData,
} from "../../../../types/request-variables";
import useServiceStore from "store/new-services.store";

type RequestVariablesProps = {
  disableRawData?: boolean;
  endpointData: EndpointType;
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpointDataId?: string) => void;
  updateEndpointRawData?: (rawData: RequestVariablesTabsRawData, endpointDataId?: string) => void;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
};

const RequestVariables: React.FC<RequestVariablesProps> = ({
  disableRawData,
  endpointData,
  updateEndpointData,
  updateEndpointRawData,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
}) => {
  const { t } = useTranslation();
  const tabs: EndpointTab[] = [EndpointTab.Params, EndpointTab.Headers, EndpointTab.Body];
  const [jsonError, setJsonError] = useState<string>();
  const [key, setKey] = useState<number>(0);
  const columnHelper = createColumnHelper<RequestVariablesTableColumns>();
  const { setEndpoints } = useServiceStore();

  const constructRow = (id: number, data: EndpointVariableData, nestedLevel: number): RequestVariablesRowData => {
    const value = isLive ? data.value : data.testValue;
    return {
      id: `${id}`,
      endpointVariableId: data.id,
      required: data.required ?? false,
      variable: data.name,
      value,
      isNameEditable: data.type === "custom",
      type: data.type,
      description: data.description,
      arrayType: data.arrayType,
      nestedLevel,
    };
  };

  const getTabsRowsData = (): RequestVariablesTabsRowsData => {
    return tabs.reduce((tabsRowsData, tab) => {
      const rows: RequestVariablesRowData[] = [];
      if (endpointData) {
        if (!endpointData[tab]) return tabsRowsData;
        let rowIdx = 0;
        endpointData[tab]!.variables.forEach((variable) => {
          rows.push(constructRow(rowIdx, variable, 0));
          if (["schema", "array"].includes(variable.type)) {
            rowIdx = getRowsFromNestedSchema(variable, rowIdx, rows, 1);
          }
          rowIdx++;
        });
      }
      if (rows.length === 0 || endpointData.type === "custom") {
        rows.push({
          id: `${rows.length}`,
          required: false,
          isNameEditable: true,
          nestedLevel: 0,
        });
      }
      return { ...tabsRowsData, [tab]: rows };
    }, {});
  };

  const getRowsFromNestedSchema = (
    variable: EndpointVariableData,
    oldRowIdx: number,
    rows: RequestVariablesRowData[],
    nestedLevel: number
  ): number => {
    let rowIdx = oldRowIdx;
    const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
    if (variableData instanceof Array) {
      (variableData as EndpointVariableData[]).forEach((data) => {
        rowIdx++;
        rows.push(constructRow(rowIdx, data, nestedLevel));
        if (["schema", "array"].includes(data.type)) {
          rowIdx = getRowsFromNestedSchema(data, rowIdx, rows, nestedLevel + 1);
        }
      });
    }
    return rowIdx;
  };

  useEffect(() => {
    setRequestTab((rt) => {
      const availableTabs = Object.keys(rowsData);
      rt.tab = availableTabs.includes(rt.tab) ? rt.tab : (availableTabs[0] as EndpointTab);
      return rt;
    });
    setKey(key + 1);
  }, []);

  const getInitialTabsRawData = (): RequestVariablesTabsRawData => {
    return tabs.reduce((tabsRawData, tab) => {
      return { ...tabsRawData, [tab]: endpointData[tab]?.rawData[isLive ? "value" : "testValue"] ?? "" };
    }, {});
  };
  const [rowsData, setRowsData] = useState<RequestVariablesTabsRowsData>(getTabsRowsData());
  const [tabRawData, setTabRawData] = useState<RequestVariablesTabsRawData>(getInitialTabsRawData());

  const getTabTriggerClasses = (tab: EndpointTab) =>
    `endpoint-tab-group__tab-btn ${requestTab.tab === tab ? "active" : ""}`;

  const updateRowVariable = (id: string, variable: string) => {
    setRowsData((prevRowsData) => {
      prevRowsData[requestTab.tab]!.map((row) => {
        if (row.id !== id) return row;
        row.variable = variable;
        return row;
      });
      // if last row name is edited, add a new row
      if (!rowsData[requestTab.tab] || id !== `${rowsData[requestTab.tab]!.length - 1}`) return prevRowsData;
      prevRowsData[requestTab.tab]!.push({
        id: `${rowsData[requestTab.tab]!.length}`,
        required: false,
        isNameEditable: true,
        nestedLevel: 0,
      });
      return prevRowsData;
    });
    updateEndpointData(rowsData, endpointData?.id);
  };

  const updateRowValue = (id: string, value: string) => {
    if (!rowsData[requestTab.tab]) return;
    rowsData[requestTab.tab]!.map((row) => {
      if (row.id !== id) return row;
      row.value = value;
      return row;
    });
    updateEndpointData(rowsData, endpointData?.id);
    setKey(key + 1);
  };

  const checkNestedVariables = (rowVariableId: string, variable: EndpointVariableData) => {
    const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
    if (variableData instanceof Array) {
      if (rowVariableId && (variableData as EndpointVariableData[]).map((v) => v.id).includes(rowVariableId)) {
        variable[variable.type === "schema" ? "schemaData" : "arrayData"] = variableData.filter(
          (v) => v.id !== rowVariableId
        );
        return;
      }
      (variableData as EndpointVariableData[]).forEach((v) => {
        if (["schema", "array"].includes(v.type)) {
          checkNestedVariables(rowVariableId, v);
        }
      });
    }
  };

  const deleteVariable = (rowData: RequestVariablesRowData) => {
    setEndpoints((prevEndpoints: EndpointData[]) => {
      return prevEndpoints.map((prevEndpoint) => {
        prevEndpoint.definedEndpoints.map((defEndpoint) => {
          if (defEndpoint.id !== endpointData.id || !defEndpoint[requestTab.tab]) return defEndpoint;
          if (
            rowData.endpointVariableId &&
            defEndpoint[requestTab.tab]!.variables.map((v) => v.id).includes(rowData.endpointVariableId)
          ) {
            defEndpoint[requestTab.tab]!.variables = defEndpoint[requestTab.tab]!.variables.filter(
              (v) => v.id !== rowData.endpointVariableId
            );
          } else {
            defEndpoint[requestTab.tab]!.variables.forEach((variable) => {
              if (["schema", "array"].includes(variable.type) && rowData.endpointVariableId) {
                checkNestedVariables(rowData.endpointVariableId, variable);
              }
            });
          }
        });
        return prevEndpoint;
      });
    });
  };

  const sortRows = (
    rowA: Row<RequestVariablesTableColumns>,
    rowB: Row<RequestVariablesTableColumns>,
    type: "variable" | "value"
  ): number => {
    if (!rowsData[requestTab.tab]) return 1;
    const valueA = rowsData[requestTab.tab]!.find((row) => row.id === rowA.id);
    const valueB = rowsData[requestTab.tab]!.find((row) => row.id === rowB.id);
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
      cell: (props) => (
        <VariableCell
          row={props.row}
          variable={rowsData[requestTab.tab]!.find((r) => r.id === props.row.id)?.variable ?? ""}
          updateRowVariable={updateRowVariable}
          rowData={rowsData[requestTab.tab]![+props.row.id]}
        />
      ),
    }),
    columnHelper.accessor("value", {
      header: t("newService.endpoint.value") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, "value");
      },
      cell: (props) => (
        <ValueCell
          row={props.row}
          requestValues={requestValues}
          isLive={isLive}
          rowData={rowsData[requestTab.tab]![+props.row.id]}
          value={rowsData[requestTab.tab]!.find((r) => r.id === props.row.id)?.value ?? ""}
          updateRowValue={updateRowValue}
        />
      ),
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
                  const rowData = rowsData[requestTab.tab]![+props.row.id];
                  deleteVariable(rowData);
                  setRowsData(getTabsRowsData());
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
            onMouseDown={() => {
              setTabRawData((prevRawData) => {
                try {
                  prevRawData[requestTab.tab] = JSON.stringify(JSON.parse(prevRawData[requestTab.tab]!), null, 4);
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
          key={`${requestTab.tab}-raw-data`}
          name={`${requestTab.tab}-raw-data`}
          label={""}
          defaultValue={tabRawData[requestTab.tab]}
          onBlur={() => {
            if (updateEndpointRawData) updateEndpointRawData(tabRawData, endpointData.id);
          }}
          onChange={(event) => {
            setJsonError(undefined);
            tabRawData[requestTab.tab] = event.target.value;
          }}
        />
      </>
    );
  };

  return (
    <Tabs.Root
      defaultValue={requestTab.tab}
      onValueChange={(value) => {
        setRequestTab((rt) => {
          rt.tab = value as EndpointTab;
          return rt;
        });
        setKey(key + 1);
      }}
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
              checked={requestTab.showRawData}
              onCheckedChange={(checked) => {
                setRequestTab((rt) => {
                  rt.showRawData = checked;
                  return rt;
                });
                setKey(key + 1);
              }}
            />
            <p style={{ whiteSpace: "nowrap", color: "#34394C" }}>Raw data</p>
          </Track>
        )}
      </Track>
      {Object.keys(rowsData).map((tab) => (
        <Tabs.Content className="endpoint-tab-group__tab-content" value={tab} key={tab}>
          {requestTab.showRawData ? (
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
