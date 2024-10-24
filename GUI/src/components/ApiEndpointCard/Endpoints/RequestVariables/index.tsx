import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, FormTextarea, SwitchBox, Track } from "../../..";
import * as Tabs from "@radix-ui/react-tabs";
import DataTable from "../../../DataTable";
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
  RequestVariablesRowData,
} from "../../../../types/request-variables";
import useServiceStore from "store/new-services.store";
import { getColumns } from "./columns";
import { PaginationState, SortingState } from "@tanstack/react-table";

type RequestVariablesProps = {
  disableRawData?: boolean;
  endpointData: EndpointType;
  parentEndpointId?: string;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
  onParametersChange: (params: EndpointVariableData[]) => void;
};

const RequestVariables: React.FC<RequestVariablesProps> = ({
  disableRawData,
  endpointData,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
  parentEndpointId,
  onParametersChange,
}) => {
  const { t } = useTranslation();
  const tabs: EndpointTab[] = [EndpointTab.Params, EndpointTab.Headers, EndpointTab.Body];
  const [jsonError, setJsonError] = useState<string>();
  const [key, setKey] = useState<number>(0);
  const { setEndpoints, updateEndpointRawData, updateEndpointData } = useServiceStore();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

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
      variableData.forEach((data) => {
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
      if (rowVariableId && variableData.map((v) => v.id).includes(rowVariableId)) {
        variable[variable.type === "schema" ? "schemaData" : "arrayData"] = variableData.filter(
          (v) => v.id !== rowVariableId
        );
        return;
      }
      variableData.forEach((v) => {
        if (["schema", "array"].includes(v.type)) {
          checkNestedVariables(rowVariableId, v);
        }
      });
    }
  };

  const deleteVariable = (rowData: RequestVariablesRowData) => {
    setEndpoints((prevEndpoints: EndpointData[]) => {
      const newEndpoints: EndpointData[] = [];
      for (const prevEndpoint of prevEndpoints) {
        const defEndpoint = prevEndpoint.definedEndpoints.find((x) => x.id === endpointData.id);
        const endpoint = defEndpoint?.[requestTab.tab];

        if (defEndpoint && endpoint) {
          if (rowData.endpointVariableId && endpoint.variables.map((v) => v.id).includes(rowData.endpointVariableId)) {
            endpoint.variables = endpoint.variables.filter((v) => v.id !== rowData.endpointVariableId);
          } else {
            endpoint.variables
              .filter((variable) => ["schema", "array"].includes(variable.type))
              .forEach((variable) => checkNestedVariables(rowData.endpointVariableId!, variable));
          }
        }

        newEndpoints.push(prevEndpoint);
      }
      return newEndpoints;
    });
  };

  const updateParams = (isValue: boolean, rowId: string, value: string) => {
    if (requestTab.tab === "params") {
      if (!rowsData[requestTab.tab]) return;
      const newData = rowsData[requestTab.tab]!.map((row) => {
        if (row.id !== rowId) return row;
        if (isValue) {
          row.value = value;
        } else {
          row.variable = value;
        }
        return row;
      });

      const parameters: EndpointVariableData[] = [];
      newData.forEach((row) => {
        if (!row.value || !row.variable) return;

        parameters.push({
          id: row.endpointVariableId !== undefined ? row.endpointVariableId : row.id,
          name: row.variable,
          type: row.type ?? "custom",
          required: row.required ?? false,
          value: row.value,
        });
      });

      onParametersChange(parameters);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        rowsData,
        updateParams,
        requestTab,
        deleteVariable,
        setRowsData,
        updateRowVariable,
        requestValues,
        isLive,
        updateRowValue,
        getTabsRowsData,
      }),
    []
  );

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
                  const content = prevRawData[requestTab.tab] ?? "";
                  prevRawData[requestTab.tab] = JSON.stringify(JSON.parse(content), null, 4);
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
          onBlur={() => updateEndpointRawData(tabRawData, endpointData.id, parentEndpointId)}
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
              <DataTable
                sortable
                data={rowsData[tab as EndpointTab]}
                columns={columns}
                setPagination={setPagination}
                setSorting={setSorting}
                pagination={pagination}
                sorting={sorting}
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
