import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button, Card, Modal, Track } from 'components';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointData } from 'types/endpoint';

import useApiRegistryStore from '../store/api-registry.store';
import ApiRegistryTable from './ApiRegistryPage/ApiRegistryTable';

const ApiRegistryPage: React.FC = () => {
  const { t } = useTranslation();
  const [deleteEndpoint, setDeleteEndpoint] = useState<EndpointData | null>(null);
  const [search, setSearch] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

  const endpoints = useApiRegistryStore((s) => s.endpoints);
  const verificationMap = useApiRegistryStore((s) => s.verificationMap);
  const totalPages = useApiRegistryStore((s) => s.totalPages);
  const loading = useApiRegistryStore((s) => s.loading);
  const loadEndpoints = useApiRegistryStore((s) => s.loadEndpoints);
  const testEndpoint = useApiRegistryStore((s) => s.testEndpoint);
  const copyEndpoint = useApiRegistryStore((s) => s.copyEndpoint);
  const deleteEndpointFromStore = useApiRegistryStore((s) => s.deleteEndpoint);

  useEffect(() => {
    void loadEndpoints(pagination, sorting, search);
  }, [loadEndpoints, pagination, sorting, search]);

  const handlePageChange = useCallback(
    (state: PaginationState) => {
      if (state.pageSize === pagination.pageSize) {
        setPagination(state);
      } else {
        setPagination({ pageIndex: 0, pageSize: state.pageSize });
      }
    },
    [pagination.pageSize],
  );

  const handleTest = useCallback(
    async (endpoint: EndpointData) => {
      setTestingId(endpoint.endpointId);
      await testEndpoint(endpoint);
      setTestingId(null);
    },
    [testEndpoint],
  );

  const handleCopy = useCallback(
    (endpoint: EndpointData) => {
      copyEndpoint(endpoint).catch(() => {
        // error handled in store (toast notification shown)
      });
    },
    [copyEndpoint],
  );

  const handleEdit = useCallback((_endpoint: EndpointData) => {
    // Edit modal not yet implemented
  }, []);

  const handleDeleteClick = useCallback((endpoint: EndpointData) => {
    setDeleteEndpoint(endpoint);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteEndpoint) return;
    deleteEndpointFromStore(deleteEndpoint)
      .then(() => setDeleteEndpoint(null))
      .catch(() => {
        // error handled in store (toast notification shown)
      });
  }, [deleteEndpoint, deleteEndpointFromStore]);

  return (
    <>
      <Track justify="between" align="center" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t('apiRegistry.title')}</h1>
        <Button appearance="primary">{t('apiRegistry.createEndpoint')}</Button>
      </Track>
      <input
        type="search"
        placeholder={`${t('global.search')}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #c8cbd8',
          borderRadius: 4,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 16,
          display: 'block',
        }}
      />
      <Card>
        <ApiRegistryTable
          t={t}
          loading={loading}
          endpoints={endpoints}
          verificationMap={verificationMap}
          totalPages={totalPages}
          pagination={pagination}
          sorting={sorting}
          setPagination={handlePageChange}
          setSorting={setSorting}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onTest={handleTest}
          onCopy={handleCopy}
          testingId={testingId}
        />
      </Card>

      {deleteEndpoint && (
        <Modal title={t('apiRegistry.deleteConfirm')} onClose={() => setDeleteEndpoint(null)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setDeleteEndpoint(null)}>
              {t('overview.cancel')}
            </Button>
            <Button appearance="error" onClick={handleConfirmDelete}>
              {t('apiRegistry.actions.delete')}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default ApiRegistryPage;
