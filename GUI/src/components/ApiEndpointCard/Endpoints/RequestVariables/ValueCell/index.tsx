import { Row } from '@tanstack/react-table';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormInput } from '../../../..';
import { RequestVariablesTableColumns } from '../../../../../types/request-variables';

type ValueCellProps = {
  row: Row<RequestVariablesTableColumns>;
  value: string;
  updateRowValue: (id: string, value: string) => void;
  onValueChange: (rowId: string, value: string) => void;
};

const ValueCell: React.FC<ValueCellProps> = ({ row, updateRowValue, value, onValueChange }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value);

  if (!row.original) return <></>;
  if (row.original.type === 'schema' || (row.original.type === 'array' && row.original.arrayType === 'schema'))
    return <></>;

  return (
    <div>
      <FormInput
        style={{ borderRadius: '4px' }}
        name={`endpoint-value-${row.id}`}
        label=""
        onChange={(e) => {
          onValueChange(row.id, e.target.value);
          setInputValue(e.target.value);
          updateRowValue(row.id, e.target.value);
        }}
        value={inputValue}
        placeholder={t('newService.endpoint.value') + '..'}
      />
    </div>
  );
};

export default ValueCell;
