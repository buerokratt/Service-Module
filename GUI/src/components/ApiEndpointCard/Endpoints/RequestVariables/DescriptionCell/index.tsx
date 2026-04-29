import { Row } from '@tanstack/react-table';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestVariablesTableColumns } from 'types/request-variables';

type DescriptionCellProps = {
  row: Row<RequestVariablesTableColumns>;
  description: string | undefined;
  updateRowDescription: (id: string, description: string) => void;
};

const DescriptionCell: React.FC<DescriptionCellProps> = ({ row, description, updateRowDescription }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(description ?? '');

  if (!row.original) return <></>;
  if (row.original.type === 'schema' || (row.original.type === 'array' && row.original.arrayType === 'schema'))
    return <></>;

  return (
    <textarea
      style={{
        width: '100%',
        minHeight: 36,
        maxHeight: 72,
        resize: 'vertical',
        borderRadius: 4,
        border: '1px solid #c8cbd8',
        padding: '4px 8px',
        fontSize: 14,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
      value={value}
      placeholder={t('newService.endpoint.paramDescription') + '..'}
      onChange={(e) => {
        setValue(e.target.value);
        updateRowDescription(row.id, e.target.value);
      }}
    />
  );
};

export default DescriptionCell;
