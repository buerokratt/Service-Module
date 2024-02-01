import React from "react";
import { useTranslation } from "react-i18next";
import { Table } from "@tanstack/react-table";
import { MdOutlineEast, MdOutlineWest } from "react-icons/md";
import PagesRow from "./PagesRow";

interface TableFooterProps {
  table: Table<any>;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  pageSizeOptions?: number[];
}

const TableFooter: React.FC<TableFooterProps> = ({
  table,
  setPageIndex,
  setPageSize,
  pageSizeOptions = [10, 20, 30, 40, 50],
}) => {
  const { t } = useTranslation();
  
  const nextPage = () => setPageIndex(prev => prev + 1);
  const previousPage = () => setPageIndex(prev => prev - 1);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setTimeout(() => {
      if(table.getState().pagination.pageIndex >= table.getPageCount()){
        setPageIndex(table.getPageCount() - 1);
      }
    }, 0);
  }

  return (
    <div className="data-table__pagination-wrapper">
      {table.getPageCount() * table.getState().pagination.pageSize > table.getState().pagination.pageSize && (
        <div className="data-table__pagination">
          <button
            className="previous"
            onClick={previousPage}
            disabled={!table.getCanPreviousPage()}
          >
            <MdOutlineWest />
          </button>
          <PagesRow table={table} setPageIndex={setPageIndex} />
          <button
            className="next"
            onClick={nextPage}
            disabled={!table.getCanNextPage()}
          >
            <MdOutlineEast />
          </button>
        </div>
      )}
      <div className="data-table__page-size">
        <label>{t('global.resultCount')}</label>
        <select
          value={table.getState().pagination.pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default TableFooter;
