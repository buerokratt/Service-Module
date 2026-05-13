import { Row } from '@tanstack/react-table';
import { FormSelect } from 'components/FormElements';
import Tooltip from 'components/Tooltip';
import i18n from 'i18n';
import React from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { RequestVariablesTableColumns } from 'types/request-variables';

const PARAM_TYPES = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE'] as const;
type ParamType = (typeof PARAM_TYPES)[number];

const typeOptions = PARAM_TYPES.map((t) => ({ label: t, value: t }));

/** Legacy 'custom' type is treated as STRING for display purposes. */
const normalizeParamType = (type: string | undefined): ParamType => {
  if (!type || type === 'custom' || !PARAM_TYPES.includes(type as ParamType)) return 'STRING';
  return type as ParamType;
};

type TypeCellProps = {
  row: Row<RequestVariablesTableColumns>;
  type: string | undefined;
  updateRowType: (id: string, type: string) => void;
};

const TypeCell: React.FC<TypeCellProps> = ({ row, type, updateRowType }) => {
  if (!row.original) return <></>;
  if (row.original.type === 'schema' || (row.original.type === 'array' && row.original.arrayType === 'schema'))
    return <></>;

  const currentType = normalizeParamType(type);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <FormSelect
        style={{ borderRadius: '4px', minWidth: '100px' }}
        name={`endpoint-type-${row.id}`}
        label=""
        options={typeOptions}
        defaultValue={currentType}
        onSelectionChange={(selection) => {
          const selected = (selection?.value as string) || 'STRING';
          updateRowType(row.id, selected);
        }}
        placeholder="STRING"
      />
      <Tooltip
        content={<span style={{ whiteSpace: 'pre-line' }}>{i18n.t('newService.endpoint.paramTypeTooltip')}</span>}
      >
        <span style={{ cursor: 'pointer', color: '#3f82ff', flexShrink: 0, lineHeight: 1 }}>
          <MdInfoOutline size={16} />
        </span>
      </Tooltip>
    </div>
  );
};

export default TypeCell;
