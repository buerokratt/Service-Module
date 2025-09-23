import React from 'react';
import { Row } from '@tanstack/react-table';
import { FormSelect } from 'components/FormElements';
import { EndpointTab } from 'types/endpoint';
import { RequestVariablesTableColumns } from 'types/request-variables';
import { RequestOperator } from 'types/endpoint/request-operator';


type OperatorCellProps = {
  row: Row<RequestVariablesTableColumns>;
  operator: RequestOperator;
  updateRowOperator: (id: string, operator: string) => void;
  onOperatorChange: (rowId: string, operator: string) => void;
  currentTab?: EndpointTab;
};

const operatorOptions = [
  { label: '=', value: '=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
];

const OperatorCell: React.FC<OperatorCellProps> = ({
  row,
  operator,
  updateRowOperator,
  onOperatorChange,
  currentTab,
}) => {
  if (!row.original) return <></>;
  if (currentTab && currentTab !== EndpointTab.Params) {
    return <></>;
  }

  if (row.original.type === 'schema' || (row.original.type === 'array' && row.original.arrayType === 'schema')) {
    return <></>;
  }

  const currentOperator = operator && operatorOptions.some((op) => op.value === operator) ? operator : '=';

  return (
    <div>
      <FormSelect
        style={{ borderRadius: '4px', minWidth: '80px' }}
        name={`endpoint-operator-${row.id}`}
        label=""
        options={operatorOptions}
        defaultValue={currentOperator}
        onSelectionChange={(selection) => {
          const selectedOperator = selection?.value || '=';
          onOperatorChange(row.id, selectedOperator);
          updateRowOperator(row.id, selectedOperator);
        }}
        placeholder="="
      />
    </div>
  );
};

export default OperatorCell;
