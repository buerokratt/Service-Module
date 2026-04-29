import { Button, Icon, Track } from '@buerokratt-ria/header/src/components';
import { createColumnHelper, Row } from '@tanstack/react-table';
import Tooltip from 'components/Tooltip';
import i18n from 'i18n';
import { Dispatch, SetStateAction } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { RequestTab } from 'types';
import { EndpointTab, PreDefinedEndpointEnvVariables } from 'types/endpoint';
import { FieldType } from 'types/endpoint/field-type';
import {
  RequestVariablesRowData,
  RequestVariablesTableColumns,
  RequestVariablesTabsRowsData,
} from 'types/request-variables';

import MandatoryCell from './MandatoryCell';
import OperatorCell from './OperatorCell';
import TypeCell from './TypeCell';
import ValueCell from './ValueCell';
import VariableCell from './VariableCell';

interface GetColumnsConfig {
  rowsData: RequestVariablesTabsRowsData;
  updateParams: (isValue: boolean, rowId: string, value: string) => void;
  updateOperator: (rowId: string, operator: string) => void;
  requestTab: RequestTab;
  deleteVariable: (rowData: RequestVariablesRowData) => void;
  setRowsData: Dispatch<SetStateAction<RequestVariablesTabsRowsData>>;
  requestValues: PreDefinedEndpointEnvVariables;
  isLive: boolean;
  updateRowField: (id: string, field: FieldType, value: string) => void;
  updateRowMandatory: (id: string, mandatory: boolean) => void;
  getTabsRowsData: () => RequestVariablesTabsRowsData;
}
const getSortValue = (rowData: RequestVariablesRowData | undefined, type: FieldType): string => {
  if (!rowData) return '';
  const val = rowData[type as keyof RequestVariablesRowData];
  if (val === undefined || val === null) return '';
  return String(val);
};

export const getColumns = ({
  rowsData,
  updateParams,
  updateOperator,
  requestTab,
  deleteVariable,
  setRowsData,
  updateRowField,
  updateRowMandatory,
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
        size: '20%',
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, 'variable');
      },
      cell: (props) => (
        <VariableCell
          row={props.row}
          variable={props.row.original.variable ?? ''}
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
            operator={props.row.original.operator ?? '='}
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
        size: '20%',
      },
      sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
        return sortRows(rowA, rowB, 'value');
      },
      cell: (props) => (
        <ValueCell
          row={props.row}
          value={props.row.original.value ?? ''}
          updateRowValue={(id, value) => {
            updateRowField(id, 'value', value);
          }}
          onValueChange={(rowId, value) => {
            updateParams(true, rowId, value);
          }}
        />
      ),
    }),
  );

  if (requestTab.tab === EndpointTab.Params) {
    columns.push(
      columnHelper.accessor('type', {
        header: i18n.t('newService.endpoint.paramType') ?? 'Type',
        meta: {
          size: '15%',
        },
        sortingFn: (rowA: Row<RequestVariablesTableColumns>, rowB: Row<RequestVariablesTableColumns>) => {
          return sortRows(rowA, rowB, 'type');
        },
        cell: (props) => {
          const isSpecParam = !props.row.original.isNameEditable;
          if (isSpecParam) {
            const rawType = props.row.original.type ?? '';
            const displayType = rawType.toLowerCase() === 'custom' ? 'STRING' : rawType.toUpperCase() || 'STRING';
            return <span style={{ fontSize: 12, color: '#5d6071', paddingLeft: 4 }}>{displayType}</span>;
          }
          return (
            <TypeCell
              row={props.row}
              type={props.row.original.type}
              updateRowType={(id, type) => {
                updateRowField(id, 'type', type);
              }}
            />
          );
        },
      }),
    );
  }

  if (requestTab.tab === EndpointTab.Params) {
    columns.push(
      columnHelper.accessor('mandatory', {
        header: i18n.t('newService.endpoint.paramMandatory') ?? 'Mandatory',
        meta: {
          size: '13%',
        },
        cell: (props) => (
          <MandatoryCell
            row={props.row}
            mandatory={props.row.original.mandatory}
            updateRowMandatory={(id, mandatory) => {
              updateRowMandatory(id, mandatory);
            }}
          />
        ),
      }),
    );
  }

  columns.push(
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
            ) : !props.row.original.isNameEditable ? (
              <Icon icon={<MdDeleteOutline />} size="medium" style={{ opacity: 0.25, cursor: 'not-allowed' }} />
            ) : (
              <Button
                appearance="text"
                onClick={() => {
                  const rowData = props.row.original;
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
