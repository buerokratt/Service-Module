import { Row } from '@tanstack/react-table';
import { FormSelect } from 'components/FormElements';
import i18n from 'i18n';
import React from 'react';
import { RequestVariablesTableColumns } from 'types/request-variables';

type MandatoryCellProps = {
  row: Row<RequestVariablesTableColumns>;
  mandatory: boolean | undefined;
  updateRowMandatory: (id: string, mandatory: boolean) => void;
};

const mandatoryOptions = [
  { label: i18n.t('newService.endpoint.mandatoryNo'), value: 'false' },
  { label: i18n.t('newService.endpoint.mandatoryYes'), value: 'true' },
];

const MandatoryCell: React.FC<MandatoryCellProps> = ({ row, mandatory, updateRowMandatory }) => {
  if (!row.original) return <></>;
  // Only render for leaf rows (not schema/array group rows)
  if (row.original.type === 'schema' || (row.original.type === 'array' && row.original.arrayType === 'schema'))
    return <></>;

  return (
    <FormSelect
      style={{ borderRadius: '4px', minWidth: '72px' }}
      name={`mandatory-${row.id}`}
      label=""
      options={mandatoryOptions}
      defaultValue={mandatory ? 'true' : 'false'}
      onSelectionChange={(selection) => {
        updateRowMandatory(row.id, selection?.value === 'true');
      }}
    />
  );
};

export default MandatoryCell;
