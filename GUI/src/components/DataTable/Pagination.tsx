import clsx from 'clsx';
import { FC, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineEast, MdOutlineWest } from 'react-icons/md';
import { Link } from 'react-router-dom';

import './DataTable.scss';

type TablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  alwaysShow?: boolean;
};

const TablePagination: FC<TablePaginationProps> = ({
  pageIndex,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  alwaysShow = false,
}) => {
  const id = useId();
  const { t } = useTranslation();
  const safePageCount = Math.max(pageCount, 1);
  const showPagination = alwaysShow || safePageCount * pageSize > pageSize;

  if (!showPagination) return null;

  return (
    <div className="data-table__pagination-wrapper">
      <div className="data-table__pagination">
        <button className="previous" onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex <= 0}>
          <MdOutlineWest />
        </button>
        <nav role="navigation" aria-label={t('global.paginationNavigation') ?? ''}>
          <ul className="links">
            {Array.from({ length: safePageCount }).map((_, index) => (
              <li key={`${id}-${index}`} className={clsx({ active: pageIndex === index })}>
                <Link
                  to={`?page=${index + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(index);
                  }}
                  aria-label={t('global.gotoPage') + index}
                  aria-current={pageIndex === index}
                >
                  {index + 1}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button className="next" onClick={() => onPageChange(pageIndex + 1)} disabled={pageIndex >= safePageCount - 1}>
          <MdOutlineEast />
        </button>
      </div>
      <div className="data-table__page-size">
        <label htmlFor={id}>{t('global.resultCount')}</label>
        <select id={id} value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {[5, 10, 20, 30, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TablePagination;
