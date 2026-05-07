import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button, Icon, Modal, Tooltip, Track } from 'components';
import AddEndpointModal from 'components/Flow/EdgeTypes/AddEndpointModal';
import { EndpointTooltipContent } from 'pages/ApiRegistryPage/ApiRegistryTable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useToastStore from 'store/toasts.store';
import './ApiElementsPanel.scss';
import {
  MdArrowDownward,
  MdArrowUpward,
  MdCancel,
  MdCheckCircle,
  MdDeleteOutline,
  MdEdit,
  MdFormatListBulleted,
  MdInfoOutline,
  MdOutlineAddBox,
  MdOutlineEast,
  MdOutlineIndeterminateCheckBox,
  MdOutlineWest,
  MdUnfoldMore,
} from 'react-icons/md';
import useApiRegistryStore from 'store/api-registry.store';
import { Step, StepType } from 'types';
import { EndpointData } from 'types/endpoint';

// ─── ApiElementsPanel ────────────────────────────────────────────────────────
// Replaces the old draggable ApiEndpoint cards inside the Elements dropdown.
// Renders as a Collapsible (matching "All elements" visual style) containing
// a search bar, sortable mini-registry table, and paginated footer.
// The + icon in the Collapsible header opens AddEndpointModal (create mode).
// ─────────────────────────────────────────────────────────────────────────────

type SortCol = 'name' | 'status' | 'schema';

/** Height of the collapsible trigger header (search bar row) in pixels */
const HEADER_HEIGHT_PX = 42;

const SortIcon: React.FC<{ colId: SortCol; currentSortId: SortCol | undefined; currentDesc: boolean }> = ({
  colId,
  currentSortId,
  currentDesc,
}) => {
  if (currentSortId !== colId) return <MdUnfoldMore style={{ verticalAlign: 'middle', opacity: 0.5 }} />;
  return currentDesc ? (
    <MdArrowDownward style={{ verticalAlign: 'middle' }} />
  ) : (
    <MdArrowUpward style={{ verticalAlign: 'middle' }} />
  );
};

interface ApiElementsPanelProps {
  onAddToCanvas: (step: Step) => void;
}

const ApiElementsPanel: React.FC<ApiElementsPanelProps> = ({ onAddToCanvas }) => {
  const { t } = useTranslation();
  const [tableOpen, setTableOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointData | null>(null);
  const [deletingEndpoint, setDeletingEndpoint] = useState<EndpointData | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endpoints = useApiRegistryStore((s) => s.endpoints);
  const verificationMap = useApiRegistryStore((s) => s.verificationMap);
  const totalPages = useApiRegistryStore((s) => s.totalPages);
  const loading = useApiRegistryStore((s) => s.loading);
  const loadEndpoints = useApiRegistryStore((s) => s.loadEndpoints);
  const testEndpoint = useApiRegistryStore((s) => s.testEndpoint);
  const deleteEndpointFromStore = useApiRegistryStore((s) => s.deleteEndpoint);
  const loadEndpointsRef = useRef(loadEndpoints);
  loadEndpointsRef.current = loadEndpoints;

  useEffect(() => {
    loadEndpointsRef.current(pagination, sorting, search).catch(() => {
      useToastStore.getState().error({ title: t('global.notificationError') });
    });
  }, [pagination, sorting, search]);

  // Debounced search reset — resets pageIndex to 0 when search changes
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const handleSort = (colId: SortCol) => {
    const currentId = sorting[0]?.id as SortCol | undefined;
    const currentDesc = sorting[0]?.desc ?? false;
    setSorting([{ id: colId, desc: currentId === colId ? !currentDesc : false }]);
  };

  const handleTest = useCallback(
    async (endpoint: EndpointData) => {
      setTestingId(endpoint.endpointId);
      await testEndpoint(endpoint);
      setTestingId(null);
    },
    [testEndpoint],
  );

  const handleRowClick = (endpoint: EndpointData, index: number) => {
    const def = endpoint.definitions.find((d) => d.isSelected) ?? endpoint.definitions[0];
    if (!def) return;

    const step: Step = {
      id: index,
      label: endpoint.name.trim() || `${(def.methodType ?? 'GET').toUpperCase()} ${def.url ?? ''}`,
      type: StepType.UserDefined,
      data: endpoint,
    };

    onAddToCanvas(step);
  };

  const handleDeleteConfirm = () => {
    if (!deletingEndpoint) return;
    deleteEndpointFromStore(deletingEndpoint)
      .then(() => setDeletingEndpoint(null))
      .catch(() => {
        useToastStore.getState().error({ title: t('global.notificationError') });
      });
    loadEndpointsRef.current(pagination, sorting, search).catch(() => {
      useToastStore.getState().error({ title: t('global.notificationError') });
    });
  };

  const currentSortId = sorting[0]?.id as SortCol | undefined;
  const currentDesc = sorting[0]?.desc ?? false;
  const pageCount = Math.max(1, totalPages);
  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex < pageCount - 1;

  return (
    <div className="collapsible api-elements-panel">
      {/* Header: collapse toggle + title + search + + New API button */}
      <div
        className="collapsible__trigger"
        aria-expanded={tableOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <button
          type="button"
          className="collapsible__button"
          onClick={() => setTableOpen((o) => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
        >
          <Icon icon={tableOpen ? <MdOutlineIndeterminateCheckBox /> : <MdOutlineAddBox />} size="medium" />
          <h3 className="h6" style={{ margin: 0 }}>
            {t('serviceFlow.apiElements.title')}
          </h3>
        </button>
        <input
          type="search"
          className="api-elements-search"
          placeholder={t('serviceFlow.apiElements.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            minWidth: 0,
            height: 40,
            padding: '4px 8px',
            background: '#FFFFFF',
            border: '1px solid #9799A4',
            borderRadius: 4,
            fontFamily: "'Roboto', sans-serif",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '24px',
            color: '#09090b',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <Button
          appearance="primary"
          onClick={(e) => {
            e.stopPropagation();
            setIsCreateOpen(true);
          }}
          style={{ whiteSpace: 'nowrap', borderRadius: 20, height: 40, padding: '8px 18px' }}
        >
          {t('serviceFlow.apiElements.newApi')}
        </Button>
      </div>

      {/* Table + footer */}
      {tableOpen && (
        <div className="collapsible__content" style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '8px 16px', margin: 0 }}>{t('global.loading')}</p>
          ) : (
            <div
              className="data-table__scrollWrapper"
              style={{ overflowX: 'hidden', maxHeight: `calc(50vh - ${HEADER_HEIGHT_PX}px)`, overflowY: 'auto' }}
            >
              <table
                className="data-table"
                style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}
              >
                <thead>
                  <tr style={{ background: '#F0F0F2', borderBottom: '1px solid #D2D3D8', height: 36 }}>
                    <th
                      onClick={() => handleSort('name')}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: '#F0F0F2',
                        borderBottom: '1px solid #D2D3D8',
                      }}
                    >
                      <SortIcon colId="name" currentSortId={currentSortId} currentDesc={currentDesc} />{' '}
                      {t('apiRegistry.columns.name')}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: 90,
                        textAlign: 'center',
                        background: '#F0F0F2',
                        borderBottom: '1px solid #D2D3D8',
                      }}
                    >
                      <SortIcon colId="status" currentSortId={currentSortId} currentDesc={currentDesc} />{' '}
                      {t('apiRegistry.columns.status')}
                    </th>
                    <th
                      onClick={() => handleSort('schema')}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: 100,
                        textAlign: 'center',
                        background: '#F0F0F2',
                        borderBottom: '1px solid #D2D3D8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <SortIcon colId="schema" currentSortId={currentSortId} currentDesc={currentDesc} />{' '}
                      {t('apiRegistry.columns.schema')}
                    </th>
                    <th style={{ width: 112, background: '#F0F0F2', borderBottom: '1px solid #D2D3D8' }} />
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint, index) => {
                    const meta = verificationMap[endpoint.endpointId];
                    const status = meta?.verificationStatus ?? 'unverified';
                    const isVerified = status === 'verified';
                    const isUntested = status === 'unverified';
                    const statusColor = isVerified ? '#27ae60' : '#e74c3c';
                    const statusCode = isUntested ? '---' : meta?.lastStatusCode ? String(meta.lastStatusCode) : '---';
                    const schemaCaptured = meta?.schemaCaptured ?? false;
                    const isTesting = testingId === endpoint.endpointId;
                    const def = endpoint.definitions?.[0];
                    return (
                      <tr
                        key={endpoint.endpointId}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(endpoint, index)}
                      >
                        <td style={{ overflow: 'hidden' }}>
                          <Tooltip content={<EndpointTooltipContent def={def} name={endpoint.name} />}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                overflow: 'hidden',
                                maxWidth: '100%',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {endpoint.name}
                              </span>
                              <Icon icon={<MdInfoOutline />} size="small" style={{ color: '#3f82ff', flexShrink: 0 }} />
                            </span>
                          </Tooltip>
                        </td>
                        <td>
                          <Track gap={6} align="center">
                            <Icon
                              icon={isVerified ? <MdCheckCircle /> : <MdCancel />}
                              size="small"
                              style={{ color: statusColor }}
                            />
                            <span style={{ color: statusColor, fontWeight: 600 }}>{statusCode}</span>
                          </Track>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Icon
                            icon={schemaCaptured ? <MdCheckCircle /> : <MdCancel />}
                            size="small"
                            style={{ color: schemaCaptured ? '#27ae60' : '#e74c3c' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <button
                              type="button"
                              title={t('apiRegistry.actions.test')}
                              disabled={isTesting}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTest(endpoint).catch(() => {
                                  useToastStore.getState().error({ title: t('global.notificationError') });
                                });
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: isTesting ? 'default' : 'pointer',
                                padding: 6,
                                opacity: isTesting ? 0.4 : 1,
                                lineHeight: 1,
                                color: '#555867',
                                fontSize: 18,
                                display: 'flex',
                              }}
                            >
                              <MdFormatListBulleted />
                            </button>
                            <button
                              type="button"
                              title={t('apiRegistry.actions.edit')}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEndpoint(endpoint);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 6,
                                lineHeight: 1,
                                color: '#555867',
                                fontSize: 18,
                                display: 'flex',
                              }}
                            >
                              <MdEdit />
                            </button>
                            <button
                              type="button"
                              title={t('apiRegistry.actions.delete')}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingEndpoint(endpoint);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 6,
                                lineHeight: 1,
                                color: '#555867',
                                fontSize: 18,
                                display: 'flex',
                              }}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div
            className="data-table__pagination-wrapper"
            style={{
              background: '#FFFFFF',
              boxShadow: '0px -1px 0px #5D6071',
              borderRadius: '0px 0px 5px 5px',
              minHeight: 40,
            }}
          >
            <div className="data-table__pagination">
              <button
                type="button"
                className="previous"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                disabled={!canPrev}
              >
                <MdOutlineWest />
              </button>
              <ul className="links">
                {Array.from({ length: pageCount }, (_, i) => (
                  <li key={i} className={i === pagination.pageIndex ? 'active' : ''}>
                    <button
                      type="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      onClick={() => setPagination((p) => ({ ...p, pageIndex: i }))}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="next"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
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
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <AddEndpointModal
          context="registry"
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onSaveSuccess={handleReload}
        />
      )}
      {editingEndpoint && (
        <AddEndpointModal
          context="registry"
          mode="edit"
          initialEndpoint={editingEndpoint}
          onClose={() => setEditingEndpoint(null)}
          onSaveSuccess={handleReload}
        />
      )}
      {deletingEndpoint && (
        <Modal title={t('apiRegistry.deleteConfirm')} onClose={() => setDeletingEndpoint(null)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setDeletingEndpoint(null)}>
              {t('overview.cancel')}
            </Button>
            <Button appearance="error" onClick={handleDeleteConfirm}>
              {t('apiRegistry.actions.delete')}
            </Button>
          </Track>
        </Modal>
      )}
    </div>
  );
};

export default ApiElementsPanel;
