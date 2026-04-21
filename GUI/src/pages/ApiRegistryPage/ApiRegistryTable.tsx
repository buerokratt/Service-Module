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
  MdUnfoldMore,
  MdArrowUpward,
  MdArrowDownward,
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

const EndpointTooltipContent: React.FC<{ def: import('types/endpoint').EndpointDefinition | undefined; name: string }> = ({ def, name }) => {
  if (!def) return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}>
      <div><strong>NAME:</strong> {name || '—'}</div>
      <div style={{ opacity: 0.6, marginTop: 4, fontSize: 11 }}>No definition available</div>
    </div>
  );

  const url = def.url || def.openApiUrl || def.path || null;
  const params = def.params?.variables?.filter((v) => v.name) ?? [];
  const headers = def.headers?.variables?.filter((v) => v.name) ?? [];
  const bodyVars = !def.body?.isRawSelected ? (def.body?.variables?.filter((v) => v.name) ?? []) : [];
  const bodyRaw = def.body?.isRawSelected ? def.body?.rawData?.value : undefined;
  const prettyBody = bodyRaw
    ? (() => { try { return JSON.stringify(JSON.parse(bodyRaw), null, 2); } catch { return bodyRaw; } })()
    : undefined;

  const S: React.CSSProperties = { display: 'block', marginBottom: 2 };
  const IND: React.CSSProperties = { paddingLeft: 16 };
  const IND2: React.CSSProperties = { paddingLeft: 32, opacity: 0.75, fontSize: 11 };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, maxWidth: 420 }}>
      <div style={S}><strong>ENDPOINT TYPE:</strong> {def.type === 'openApi' ? 'OpenAPI' : 'Custom'}</div>
      {url && <div style={S}><strong>URL:</strong> {url}</div>}
      {def.methodType && <div style={S}><strong>METHOD:</strong> {def.methodType}</div>}

      {params.length > 0 && (
        <>
          <div style={{ ...S, marginTop: 4 }}><strong>PARAMETERS:</strong></div>
          {params.map((v) => {
            const rawType = v.type ?? '';
            const displayType = rawType.toLowerCase() === 'custom' ? 'STRING' : rawType.toUpperCase();
            return (
              <React.Fragment key={v.id}>
                <div style={IND}>{v.name} : {v.value ?? v.testValue ?? '—'}</div>
                <div style={IND2}>{v.name}_type : {displayType}</div>
              </React.Fragment>
            );
          })}
        </>
      )}

      {headers.length > 0 && (
        <>
          <div style={{ ...S, marginTop: 4 }}><strong>HEADERS:</strong></div>
          {headers.map((v) => (
            <div key={v.id} style={IND}>{v.name} : {v.value ?? v.testValue ?? '—'}</div>
          ))}
        </>
      )}

      {prettyBody && (
        <>
          <div style={{ ...S, marginTop: 4 }}><strong>BODY:</strong></div>
          <pre style={{ margin: 0, ...IND, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{prettyBody}</pre>
        </>
      )}

      {!prettyBody && bodyVars.length > 0 && (
        <>
          <div style={{ ...S, marginTop: 4 }}><strong>BODY:</strong></div>
          {bodyVars.map((v) => (
            <div key={v.id} style={IND}>{v.name} : {v.value ?? v.testValue ?? '—'}</div>
          ))}
        </>
      )}
    </div>
  );
};

const ApiRegistryTable: React.FC<ApiRegistryTableProps> = ({
  t,
  loading,
  endpoints,
  verificationMap,
  totalPages,
  pagination,
  setPagination,
  sorting,
  setSorting,
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

  const SORTABLE_COLUMNS = ['name', 'lastTest', 'status', 'schema'] as const;
  type SortableCol = typeof SORTABLE_COLUMNS[number];

  const currentSortId = sorting[0]?.id as SortableCol | undefined;
  const currentDesc = sorting[0]?.desc ?? false;

  const handleSort = (colId: SortableCol) => {
    if (currentSortId === colId) {
      setSorting([{ id: colId, desc: !currentDesc }]);
    } else {
      setSorting([{ id: colId, desc: false }]);
    }
  };

  const SortIcon = ({ colId }: { colId: SortableCol }) => {
    if (currentSortId !== colId) return <MdUnfoldMore style={{ verticalAlign: 'middle', opacity: 0.4 }} />;
    return currentDesc
      ? <MdArrowDownward style={{ verticalAlign: 'middle' }} />
      : <MdArrowUpward style={{ verticalAlign: 'middle' }} />;
  };

  return (
    <>
      <div className="data-table__scrollWrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                {String(t('apiRegistry.columns.name'))} <SortIcon colId="name" />
              </th>
              <th
                onClick={() => handleSort('lastTest')}
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                {String(t('apiRegistry.columns.lastTest'))} <SortIcon colId="lastTest" />
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              >
                {String(t('apiRegistry.columns.status'))} <SortIcon colId="status" />
              </th>
              <th
                onClick={() => handleSort('schema')}
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}
              >
                {String(t('apiRegistry.columns.schema'))} <SortIcon colId="schema" />
              </th>
              <th>{String(t('apiRegistry.columns.actions'))}</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint) => {
              const def = endpoint.definitions?.[0];
              const label = def?.label || endpoint.name || '';
              const meta = verificationMap[endpoint.endpointId];
              const schemaCaptured = meta?.schemaCaptured ?? false;
              const isTesting = testingId === endpoint.endpointId;
              return (
                <tr key={endpoint.endpointId}>
                  <td>
                    <Tooltip content={<EndpointTooltipContent def={def} name={label} />}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <span>{truncateName(label)}</span>
                        <Icon icon={<MdInfoOutline />} size="small" style={{ color: '#3f82ff' }} />
                      </span>
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
                      const status = meta?.verificationStatus ?? 'unverified';
                      const isVerified = status === 'verified';
                      const isUntested = status === 'unverified';
                      const code = isUntested ? '---' : (meta?.lastStatusCode ? String(meta.lastStatusCode) : '---');
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
