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
import React, { CSSProperties, FC, ReactNode } from 'react';
import { MdExpandLess, MdExpandMore, MdUnfoldMore } from 'react-icons/md';

import Filter from './Filter';
import TablePagination from './Pagination';
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
  withScrollWrapper?: boolean;
  renderSubRow?: (row: Row<any>) => ReactNode;
  renderBeforeRow?: (row: Row<any>, index: number) => ReactNode;
  stickyHeader?: boolean;
  hidePagination?: boolean;
  emptyMessage?: string;
  alwaysShowPagination?: boolean;
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
    getRowStyles?: (row: Row<TData>) => CSSProperties;
    getRowProps?: (row: Row<TData>) => Record<string, string>;
    onRowClick?: (row: Row<TData>) => void;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value as string);
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
  withScrollWrapper = true,
  renderSubRow,
  renderBeforeRow,
  stickyHeader = false,
  hidePagination = false,
  emptyMessage,
  alwaysShowPagination = false,
}) => {
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
      pagination: tablePagination,
      columnFilters,
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
    <div
      className={`data-table${withScrollWrapper ? '__scrollWrapper' : ''}`}
      style={withScrollWrapper ? undefined : { overflowX: 'hidden' }}
    >
      <table className={clsx('data-table', stickyHeader && 'data-table--sticky-header')}>
        {!disableHead && (
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.column.columnDef.size }}>
                    {header.isPlaceholder ? null : (
                      <Track gap={8}>
                        {sortable && header.column.getCanSort() && (
                          <button type="button" onClick={header.column.getToggleSortingHandler()}>
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
          {table.getRowModel().rows.length === 0 && emptyMessage ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, index) => {
              const subRowContent = renderSubRow?.(row);
              const beforeRowContent = renderBeforeRow?.(row, index);
              return (
                <React.Fragment key={row.id}>
                  {beforeRowContent}
                  <tr
                    style={table.options.meta?.getRowStyles?.(row)}
                    {...table.options.meta?.getRowProps?.(row)}
                    onClick={() => table.options.meta?.onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={subRowContent ? { borderBottom: 'none' } : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {subRowContent && (
                    <tr className="data-table__sub-row">
                      <td colSpan={row.getVisibleCells().length} className="data-table__sub-row-cell">
                        {subRowContent}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      {tablePagination && !hidePagination && (
        <TablePagination
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          pageCount={table.getPageCount()}
          alwaysShow={alwaysShowPagination}
          onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
          onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
        />
      )}
    </div>
  );
};

export default DataTable;
