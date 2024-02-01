import React from "react";
import { Icon, Track } from "@buerokratt-ria/header/src/header/components";
import { ColumnDef, Table, flexRender } from "@tanstack/react-table";
import { MdExpandLess, MdExpandMore, MdUnfoldMore } from "react-icons/md";
import Filter from "./Filter";

type ColumnMeta = {
  meta: {
    size: number | string
  }
}

type CustomColumnDef = ColumnDef<any> & ColumnMeta;

interface TableHeaderProps {
  table: Table<any>;
  sortable: boolean | undefined;
  filterable: boolean | undefined;
}

const TableHeader: React.FC<TableHeaderProps> = ({ table, sortable, filterable }) => {
  return <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id} style={{ width: (header.column.columnDef as CustomColumnDef).meta?.size }}>
            {header.isPlaceholder ? null : (
              <>
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
                  {filterable && header.column.getCanFilter() && (
                    <Filter column={header.column} table={table} />
                  )}
                </Track>
              </>
            )}
          </th>
        ))}
      </tr>
    ))}
  </thead>
}

export default TableHeader;
