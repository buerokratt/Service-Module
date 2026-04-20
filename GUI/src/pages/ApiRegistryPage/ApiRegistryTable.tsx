import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button, Icon, Tooltip, Track } from 'components';
import { TFunction } from 'i18next';
import React from 'react';
import {
  MdOutlineEast,
  MdOutlineWest,
  MdInfoOutline,
  MdCheckCircle,
  MdCancel,
  MdContentCopy,
  MdFormatListBulleted,
  MdEdit,
  MdDeleteOutline,
} from 'react-icons/md';
import { VerificationMetadata } from 'store/api-registry.store';
import { EndpointData } from 'types/endpoint';

import { formatLastTest, truncateName } from './columns';

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
              <th style={{ textAlign: 'center' }}>{String(t('apiRegistry.columns.schema'))}</th>
              <th>{String(t('apiRegistry.columns.actions'))}</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint) => {
              const def = endpoint.definitions?.[0];
              const label = def?.label ?? endpoint.name ?? '';
              const meta = verificationMap[endpoint.endpointId];
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
                      <Track gap={4} align="center" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                        <span>{truncateName(label)}</span>
                        <Icon icon={<MdInfoOutline />} size="small" style={{ color: '#3f82ff' }} />
                      </Track>
                    </Tooltip>
                  </td>
                  <td>
                    {(() => {
                      const val = formatLastTest(meta?.lastTestAt ?? null);
                      return val === '---'
                        ? <span style={{ color: '#e74c3c', fontWeight: 600 }}>{val}</span>
                        : val;
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const isVerified = meta?.verificationStatus === 'verified';
                      const code = meta?.lastStatusCode ? String(meta.lastStatusCode) : '---';
                      const color = isVerified ? '#27ae60' : '#e74c3c';
                      return (
                        <Track gap={6} align="center">
                          <Icon
                            icon={isVerified ? <MdCheckCircle /> : <MdCancel />}
                            size="small"
                            style={{ color }}
                          />
                          <span style={{ color, fontWeight: 600 }}>{code}</span>
                        </Track>
                      );
                    })()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Icon
                      icon={schemaCaptured ? <MdCheckCircle /> : <MdCancel />}
                      size="small"
                      style={{ color: schemaCaptured ? '#27ae60' : '#e74c3c' }}
                    />
                  </td>
                  <td>
                    <Track gap={8}>
                      <Button appearance="text" size="s" onClick={() => onCopy(endpoint)}>
                        <Track gap={4} align="center">
                          <span style={{ color: '#000' }}><MdContentCopy /></span>
                          {t('apiRegistry.actions.copy')}
                        </Track>
                      </Button>
                      <Button
                        appearance="text"
                        size="s"
                        onClick={() => onTest(endpoint)}
                        disabled={isTesting}
                        style={isTesting ? { opacity: 0.7 } : undefined}
                      >
                        <Track gap={4} align="center">
                          <span style={{ color: '#000' }}><MdFormatListBulleted /></span>
                          {isTesting ? t('global.loading') : t('apiRegistry.actions.test')}
                        </Track>
                      </Button>
                      <Button appearance="text" size="s" onClick={() => onEdit(endpoint)}>
                        <Track gap={4} align="center">
                          <span style={{ color: '#000' }}><MdEdit /></span>
                          {t('apiRegistry.actions.edit')}
                        </Track>
                      </Button>
                      <Button appearance="text" size="s" onClick={() => onDelete(endpoint)}>
                        <Track gap={4} align="center">
                          <span style={{ color: '#000' }}><MdDeleteOutline /></span>
                          {t('apiRegistry.actions.delete')}
                        </Track>
                      </Button>
                    </Track>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
          <ul className="links">
            {Array.from({ length: pageCount }, (_, i) => (
              <li key={i} className={i === pagination.pageIndex ? 'active' : ''}>
                <span
                  role="button"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPagination({ ...pagination, pageIndex: i })}
                >
                  {i + 1}
                </span>
              </li>
            ))}
          </ul>
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
    </>
  );
};

export default ApiRegistryTable;
