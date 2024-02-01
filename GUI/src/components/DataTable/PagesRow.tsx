import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Table } from "@tanstack/react-table";
import clsx from 'clsx'

interface PagesRowProps {
  table: Table<any>;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  pagesShown?: number;
}

const PagesRow: React.FC<PagesRowProps> = ({ 
  table,
  setPageIndex,
  pagesShown = 7,
}) => {
  const { t } = useTranslation();

  const pages = useMemo(() => {
    const current = table.getState().pagination.pageIndex;
    const pages: number[] = [];
    const lastShownPage = Math.min(table.getPageCount(), current + pagesShown);

    pages.push(current);

    for (; pages.length < Math.min(pagesShown, table.getPageCount());) {
      if (pages[0] > 0) pages.unshift(pages[0] - 1);
      if (pages[pages.length - 1] + 1 < lastShownPage) {
        pages.push(pages[pages.length - 1] + 1);
      }
    }

    return pages;
  }, [pagesShown]);

  return (
    <nav role="navigation" aria-label={t('global.paginationNavigation') || ''}>
      <ul className="links">
        {pages.map((page, i) => {
          if ((i === 0 && page !== 0) ||
            (i === pagesShown - 1 && page !== table.getPageCount() - 1)) {
            return <p key={page}>...</p>;
          }
          return (
            <li
              key={page}
              className={clsx({ active: table.getState().pagination.pageIndex === page })}
            >
              <Link
                to='#'
                onClick={() => setPageIndex(page)}
                aria-label={t('global.gotoPage') + page}
                aria-current={table.getState().pagination.pageIndex === page}
              >
                {page + 1}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PagesRow;
