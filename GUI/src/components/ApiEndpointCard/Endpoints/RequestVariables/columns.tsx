import { Button, Icon, Track } from '@buerokratt-ria/header/src/components';
import { createColumnHelper, Row } from '@tanstack/react-table';
import Tooltip from 'components/Tooltip';
import i18n from 'i18n';
import { MdDeleteOutline } from 'react-icons/md';
import { RequestTab } from 'types';
import { EndpointTab, PreDefinedEndpointEnvVariables } from 'types/endpoint';
import {
  RequestVariablesRowData,
  RequestVariablesTableColumns,
  RequestVariablesTabsRowsData,
} from 'types/request-variables';

import ValueCell from './ValueCell';
import VariableCell from './VariableCell';
import OperatorCell from './OperatorCell';
import { FieldType } from 'types/endpoint/field-type';

interface GetColumnsConfig {
  rowsData: RequestVariablesTabsRowsData;
  updateParams: (isValue: boolean, rowId: string, value: string) => void;
  updateOperator: (rowId: string, operator: string) => void;
  requestTab: RequestTab;
  deleteVariable: (rowData: RequestVariablesRowData) => void;
  setRowsData: React.Dispatch<React.SetStateAction<RequestVariablesTabsRowsData>>;
  requestValues: PreDefinedEndpointEnvVariables;
  isLive: boolean;
  updateRowField: (id: string, field: FieldType, value: string) => void;
  getTabsRowsData: () => RequestVariablesTabsRowsData;
}

const getSortValue = (rowData: RequestVariablesRowData | undefined, type: FieldType): string => {
  if (!rowData) return '';

  return rowData[type] ?? '';
};

export const getColumns = ({
  rowsData,
  updateParams,
  updateOperator,
  requestTab,
  deleteVariable,
  setRowsData,
  updateRowField,
  getTabsRowsData,
}: GetColumnsConfig) => {
  const columnHelper = createColumnHelper<RequestVariablesTableColumns>();

  const sortRows = (
    rowA: Row<RequestVariablesTableColumns>,
    rowB: Row<RequestVariablesTableColumns>,
    type: FieldType,
  ): number => {
    if (!rowsData[requestTab.tab]) return 1;
    const valueA = rowsData[requestTab.tab]!.find((row) => row.id === rowA.id);
    const valueB = rowsData[requestTab.tab]!.find((row) => row.id === rowB.id);

    const aValue = getSortValue(valueA, type);
    const bValue = getSortValue(valueB, type);

    return (aValue ?? '') < (bValue ?? '') ? 1 : -1;
  };

  const columns: any = [
    columnHelper.accessor('variable', {
      header: i18n.t('newService.endpoint.variable') ?? '',
      meta: {
        size: '50%',
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, 'variable');
      },
      cell: (props) => (
        <VariableCell
          row={props.row}
          variable={rowsData[requestTab.tab]!.find((r) => r.id === props.row.id)?.variable ?? ''}
          updateRowVariable={(id, variable) => {
            updateRowField(id, 'variable', variable);
          }}
          onValueChange={(rowId, value) => {
            updateParams(false, rowId, value);
          }}
        />
      ),
    }),
  ];

  if (requestTab.tab === EndpointTab.Params) {
    columns.push(
      columnHelper.accessor('operator', {
        header: i18n.t('newService.endpoint.operator') ?? 'Operator',
        meta: {
          size: '15%',
        },
        sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
          return sortRows(rowA, rowB, 'operator');
        },
        cell: (props) => (
          <OperatorCell
            row={props.row}
            operator={rowsData[requestTab.tab]!.find((r) => r.id === props.row.id)?.operator ?? '='}
            updateRowOperator={(id, operator) => {
              updateRowField(id, 'operator', operator);
            }}
            onOperatorChange={(rowId, operator) => {
              updateOperator(rowId, operator);
            }}
            currentTab={requestTab.tab}
          />
        ),
      }),
    );
  }

  columns.push(
    columnHelper.accessor('value', {
      header: i18n.t('newService.endpoint.value') ?? '',
      meta: {
        size: '50%',
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, 'value');
      },
      cell: (props) => (
        <ValueCell
          row={props.row}
          value={rowsData[requestTab.tab]!.find((r) => r.id === props.row.id)?.value ?? ''}
          updateRowValue={(id, value) => {
            updateRowField(id, 'value', value);
          }}
          onValueChange={(rowId, value) => {
            updateParams(true, rowId, value);
          }}
        />
      ),
    }),
    columnHelper.display({
      id: 'delete',
      meta: {
        size: '10%',
      },
      cell: (props) => {
        return (
          <Track justify="center" style={{ paddingRight: 8 }}>
            {props.row.original.required ? (
              <Tooltip content={i18n.t('newService.endpoint.required')}>
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
  );

  return columns;
};
