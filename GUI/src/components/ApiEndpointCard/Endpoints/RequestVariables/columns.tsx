import { Row, createColumnHelper } from "@tanstack/react-table";
import { RequestVariablesRowData, RequestVariablesTableColumns, RequestVariablesTabsRowsData } from "types/request-variables";
import VariableCell from "./VariableCell";
import Tooltip from "components/Tooltip";
import { Button, Icon, Track } from "@buerokratt-ria/header/src/header/components";
import { MdDeleteOutline } from "react-icons/md";
import ValueCell from "./ValueCell";
import i18n from "i18n";
import { PreDefinedEndpointEnvVariables } from "types/endpoint";
import { RequestTab } from "types";

interface GetColumnsConfig {
  rowsData: RequestVariablesTabsRowsData,
  updateParams: (isValue: boolean, rowId: string, value: string) => void,
  requestTab: RequestTab,
  deleteVariable: (rowData: RequestVariablesRowData) => void,
  setRowsData: React.Dispatch<React.SetStateAction<RequestVariablesTabsRowsData>>,
  updateRowVariable: (id: string, variable: string) => void,
  requestValues: PreDefinedEndpointEnvVariables,
  isLive: boolean,
  updateRowValue: (id: string, value: string) => void,
  getTabsRowsData: () => RequestVariablesTabsRowsData,
}

export const getColumns = ({
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
}: GetColumnsConfig) => {
  const columnHelper = createColumnHelper<RequestVariablesTableColumns>();

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
  
  return [
    columnHelper.accessor("variable", {
      header: i18n.t("newService.endpoint.variable") ?? "",
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
          onValueChange={(rowId, value) => {
            updateParams(false, rowId, value);
          }}
        />
      ),
    }),
    columnHelper.accessor("value", {
      header: i18n.t("newService.endpoint.value") ?? "",
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
          onValueChange={(rowId, value) => {
            updateParams(true, rowId, value);
          }}
        />
      ),
    }),
    columnHelper.display({
      id: "delete",
      cell: (props) => {
        return (
          <Track justify="center" style={{ paddingRight: 8 }}>
            {props.row.original.required ? (
              <Tooltip content={i18n.t("newService.endpoint.required")}>
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
  ]
}
