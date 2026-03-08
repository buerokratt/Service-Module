import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button, Icon, Tooltip, Track } from 'components';
import { TFunction } from 'i18next';
import React from 'react';
import { MdOutlineEast, MdOutlineWest } from 'react-icons/md';
import { VerificationMetadata } from 'store/api-registry.store';
import { EndpointData } from 'types/endpoint';

import { formatLastTest, formatStatus, truncateName } from './columns';

type ApiRegistryTableProps = {
  t: TFunction;
  loading: boolean;
  endpoints: EndpointData[];
  verificationMap: Record<string, VerificationMetadata>;
  totalPages: number;
  pagination: PaginationState;
  sorting: SortingState;
  setPagination: (state: PaginationState) => void;
  setSorting: (state: SortingState) => void;
  onEdit: (endpoint: EndpointData) => void;
  onDelete: (endpoint: EndpointData) => void;
  onTest: (endpoint: EndpointData) => void;
  onCopy: (endpoint: EndpointData) => void;
  testingId: string | null;
};

const ApiRegistryTable: React.FC<ApiRegistryTableProps> = ({
  t,
  loading,
  endpoints,
  verificationMap,
  totalPages,
  pagination,
  setPagination,
  sorting: _sorting,
  setSorting: _setSorting,
  onEdit,
  onDelete,
  onTest,
  onCopy,
  testingId,
}) => {
  if (loading) {
    return <p>{t('global.loading')}</p>;
  }

  const pageCount = Math.max(1, totalPages);
  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex < pageCount - 1;

  return (
    <>
      <div className="data-table__scrollWrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>{String(t('apiRegistry.columns.name'))}</th>
              <th>{String(t('apiRegistry.columns.lastTest'))}</th>
              <th>{String(t('apiRegistry.columns.status'))}</th>
              <th>{String(t('apiRegistry.columns.schema'))}</th>
              <th>{String(t('apiRegistry.columns.actions'))}</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint) => {
              const def = endpoint.definitions?.[0];
              const label = def?.label ?? endpoint.name ?? '';
              const meta = verificationMap[endpoint.endpointId];
              const { icon: statusIcon, text: statusText } = formatStatus(meta);
              const schemaCaptured = meta?.schemaCaptured ?? false;
              const isTesting = testingId === endpoint.endpointId;
              return (
                <tr key={endpoint.endpointId}>
                  <td>
                    <Tooltip
                      content={
                        <Track direction="vertical" gap={4}>
                          <span>
                            <strong>{t('apiRegistry.tooltip.fullName')}:</strong> {label}
                          </span>
                          <span>
                            <strong>{t('apiRegistry.tooltip.description')}:</strong> {def?.description ?? '—'}
                          </span>
                          <span>
                            <strong>{t('apiRegistry.tooltip.method')}:</strong> {def?.methodType ?? '—'}
                          </span>
                          <span>
                            <strong>{t('apiRegistry.tooltip.url')}:</strong>{' '}
                            {def?.url ?? def?.openApiUrl ?? def?.path ?? '—'}
                          </span>
                        </Track>
                      }
                    >
                      <span>{truncateName(label)}</span>
                    </Tooltip>
                  </td>
                  <td>{formatLastTest(meta?.lastTestAt ?? null)}</td>
                  <td>
                    <Track gap={8} align="center">
                      <Icon icon={statusIcon} size="small" />
                      <span>{statusText}</span>
                    </Track>
                  </td>
                  <td>{schemaCaptured ? t('global.yes') : t('apiRegistry.noSchema')}</td>
                  <td>
                    <Track gap={8}>
                      <Button appearance="secondary" size="s" onClick={() => onCopy(endpoint)}>
                        {t('apiRegistry.actions.copy')}
                      </Button>
                      <Button
                        appearance="secondary"
                        size="s"
                        onClick={() => onTest(endpoint)}
                        disabled={isTesting}
                        style={isTesting ? { opacity: 0.7 } : undefined}
                      >
                        {isTesting ? t('global.loading') : t('apiRegistry.actions.test')}
                      </Button>
                      <Button appearance="secondary" size="s" onClick={() => onEdit(endpoint)}>
                        {t('apiRegistry.actions.edit')}
                      </Button>
                      <Button appearance="secondary" size="s" onClick={() => onDelete(endpoint)}>
                        {t('apiRegistry.actions.delete')}
                      </Button>
                    </Track>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="data-table__pagination-wrapper">
          <div className="data-table__pagination">
            <button
              type="button"
              className="previous"
              onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
              disabled={!canPrev}
            >
              <MdOutlineWest />
            </button>
            <span>
              {t('global.resultCount')} {pagination.pageSize} — {pagination.pageIndex + 1} / {pageCount}
            </span>
            <button
              type="button"
              className="next"
              onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
              disabled={!canNext}
            >
              <MdOutlineEast />
            </button>
          </div>
          <div className="data-table__page-size">
            <label>{t('global.resultCount')}</label>
            <select
              value={pagination.pageSize}
              onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiRegistryTable;
