import React, { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  FilterFn,
  getFilteredRowModel,
  VisibilityState,
  getPaginationRowModel,
  TableMeta,
  Row,
  RowData,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import TableHeader from './TableHeader';
import TableFooter from './TableFooter';
import './DataTable.scss';

type DataTableProps = {
  data: any
  columns: ColumnDef<any, any>[]
  tableBodyPrefix?: ReactNode
  sortable?: boolean
  filterable?: boolean
  globalFilter?: string
  setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>
  columnVisibility?: VisibilityState
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>
  disableHead?: boolean
  meta?: TableMeta<any>
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }

  interface FilterMeta {
    itemRank: RankingInfo
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank,
  })
  return itemRank.passed
}

const DataTable: FC<DataTableProps> = ({
  data,
  columns,
  tableBodyPrefix,
  sortable,
  filterable,
  globalFilter,
  setGlobalFilter,
  columnVisibility,
  setColumnVisibility,
  disableHead,
  meta,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination: { 
        pageIndex,
        pageSize,
      },
    },
    meta,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(sortable && { getSortedRowModel: getSortedRowModel() }),
  })

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        {!disableHead && <TableHeader table={table} sortable={sortable} filterable={filterable} />}
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
      <TableFooter table={table} setPageIndex={setPageIndex} setPageSize={setPageSize} />
    </div>
  )
}

export default DataTable
