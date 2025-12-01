import { Column, Table } from '@tanstack/react-table';
import React, { FC, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineSearch } from 'react-icons/md';

import DebouncedInput from './DebouncedInput';
import { Icon } from '../../components';

type FilterProps = {
  column: Column<any, unknown>;
  table: Table<any>;
};

const Filter: FC<FilterProps> = ({ column, table }) => {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const handleFilterToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setFilterOpen(!filterOpen);
  };

  return (
    <>
      <button onClick={handleFilterToggle}>
        <Icon icon={<MdOutlineSearch fontSize={16} />} size="medium" />
      </button>
      {filterOpen && (
        <div className="data-table__filter">
          {typeof firstValue === 'number' ? (
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
            />
          ) : (
            <DebouncedInput
              type="text"
              value={(columnFilterValue ?? '') as string}
              onChange={(value) => column.setFilterValue(value)}
              placeholder={t('global.search') + '...'}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Filter;
