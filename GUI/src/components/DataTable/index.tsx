import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  RowData,
  SortingState,
  TableMeta,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { Icon, Track } from 'components';
import React, { CSSProperties, FC, ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore, MdOutlineEast, MdOutlineWest, MdUnfoldMore } from 'react-icons/md';
import { Link } from 'react-router-dom';

import Filter from './Filter';
import './DataTable.scss';

type DataTableProps = {
  data: any;
  columns: ColumnDef<any, any>[];
  tableBodyPrefix?: ReactNode;
  isClientSide?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: PaginationState;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  setPagination?: (state: PaginationState) => void;
  setSorting?: (state: SortingState) => void;
  setFiltering?: (state: ColumnFiltersState) => void;
  globalFilter?: string;
  setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>;
  columnVisibility?: VisibilityState;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  disableHead?: boolean;
  pagesCount?: number;
  meta?: TableMeta<any>;
  withScrollWrapper?: boolean
};

type ColumnMeta = {
  meta: {
    size: number | string;
  };
};

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }

  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties;
  }
}

type CustomColumnDef = ColumnDef<any> & ColumnMeta;

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });
  return itemRank.passed;
};

const DataTable: FC<DataTableProps> = ({
  data,
  columns,
  tableBodyPrefix,
  sortable,
  filterable,
  isClientSide = true,
  pagination,
  sorting,
  columnFilters,
  setPagination,
  setSorting,
  setFiltering,
  globalFilter,
  setGlobalFilter,
  columnVisibility,
  setColumnVisibility,
  disableHead,
  pagesCount,
  meta,
  withScrollWrapper = true
}) => {
  const id = useId();
  const { t } = useTranslation();
  const tablePagination = pagination ?? {
    pageIndex: 0,
    pageSize: 10,
  };

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      ...{ pagination: tablePagination },
      ...{ columnFilters },
    },
    meta,
    onColumnFiltersChange: (updater) => {
      if (typeof updater !== 'function') return;
      setFiltering?.(updater(table.getState().columnFilters));
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: fuzzyFilter,
    onSortingChange: (updater) => {
      if (typeof updater !== 'function') return;
      setSorting?.(updater(table.getState().sorting));
    },
    onPaginationChange: (updater) => {
      if (typeof updater !== 'function') return;
      setPagination?.(updater(table.getState().pagination));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(sortable && { getSortedRowModel: getSortedRowModel() }),
    manualPagination: isClientSide ? undefined : true,
    manualFiltering: isClientSide ? undefined : true,
    manualSorting: isClientSide ? undefined : true,
    pageCount: isClientSide ? undefined : pagesCount,
  });

  return (
    <div className={`data-table${withScrollWrapper ? '__scrollWrapper' : ''}`}>
      <table className="data-table">
        {!disableHead && (
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.column.columnDef.size }}>
                    {header.isPlaceholder ? null : (
                      <Track gap={8}>
                        {sortable && header.column.getCanSort() && (
                          <button onClick={header.column.getToggleSortingHandler()}>
                            {{
                              asc: <Icon icon={<MdExpandMore fontSize={20} />} size="medium" />,
                              desc: <Icon icon={<MdExpandLess fontSize={20} />} size="medium" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <Icon icon={<MdUnfoldMore fontSize={22} />} size="medium" />
                            )}
                          </button>
                        )}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {filterable && header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                      </Track>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {tableBodyPrefix}
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} style={table.options.meta?.getRowStyles(row)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {tablePagination && (
        <div className="data-table__pagination-wrapper">
          {table.getPageCount() * table.getState().pagination.pageSize > table.getState().pagination.pageSize && (
            <div className="data-table__pagination">
              <button className="previous" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <MdOutlineWest />
              </button>
              <nav role="navigation" aria-label={t('global.paginationNavigation') ?? ''}>
                <ul className="links">
                  {[...Array(table.getPageCount())].map((_, index) => (
                    <li
                      key={`${id}-${index}`}
                      className={clsx({ active: table.getState().pagination.pageIndex === index })}
                    >
                      <Link
                        to={`?page=${index + 1}`}
                        onClick={() => table.setPageIndex(index)}
                        aria-label={t('global.gotoPage') + index}
                        aria-current={table.getState().pagination.pageIndex === index}
                      >
                        {index + 1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <button
                className="next"
                onClick={() => {
                  table.nextPage();
                }}
                disabled={!table.getCanNextPage()}
              >
                <MdOutlineEast />
              </button>
            </div>
          )}
          <div className="data-table__page-size">
            <label htmlFor={id}>{t('global.resultCount')}</label>
            <select
              id={id}
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
