import { PaginationState, SortingState } from '@tanstack/react-table';
import { deleteEndpoint as deleteEndpointUrl, getCommonEndpoints } from 'resources/api-constants';
import api from 'services/api-dev';
import { EndpointData } from 'types/endpoint';
import { create } from 'zustand';

import useToastStore from './toasts.store';

export interface VerificationMetadata {
  lastTestAt: string | null;
  verificationStatus: 'verified' | 'failed' | 'unverified';
  lastStatusCode: string | null;
  schemaCaptured: boolean;
}

interface ApiRegistryState {
  endpoints: EndpointData[];
  verificationMap: Record<string, VerificationMetadata>;
  totalPages: number;
  loading: boolean;
  loadEndpoints: (pagination: PaginationState, sorting: SortingState, search: string) => Promise<void>;
  testEndpoint: (endpoint: EndpointData) => Promise<void>;
  copyEndpoint: (endpoint: EndpointData) => Promise<void>;
  deleteEndpoint: (endpoint: EndpointData) => Promise<void>;
  addEndpointAfterCreate: (endpoint: EndpointData) => void;
  updateEndpointInList: (endpoint: EndpointData) => void;
}

const useApiRegistryStore = create<ApiRegistryState>((set) => ({
  endpoints: [],
  verificationMap: {},
  totalPages: 0,
  loading: false,

  loadEndpoints: async (pagination, sorting, search) => {
    set({ loading: true });
    try {
      const order = sorting[0]?.desc ? 'desc' : 'asc';
      const sort = sorting.length === 0 ? 'created_at desc' : `${sorting[0]?.id} ${order}`;
      const result = await api.post(getCommonEndpoints(), {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sorting: sort,
        search: search || '',
        pagination: true,
      });
      const rows: any[] = result.data?.response ?? [];
      const totalPages: number = rows[0]?.totalPages ?? 0;
      const endpoints: EndpointData[] = rows.map((row) => ({
        endpointId: row.endpointId,
        name: row.name,
        type: row.type,
        isCommon: row.isCommon,
        serviceId: row.serviceId,
        definitions: row.definitions ?? [],
      }));
      const verificationMap: Record<string, VerificationMetadata> = {};
      rows.forEach((row) => {
        if (row.endpointId) {
          verificationMap[row.endpointId] = {
            lastTestAt: row.lastTestAt ?? null,
            verificationStatus: row.verificationStatus === true
              ? 'verified'
              : row.lastTestAt
                ? 'failed'
                : 'unverified',
            lastStatusCode: row.lastStatusCode ?? null,
            schemaCaptured: row.schemaCaptured ?? false,
          };
        }
      });
      set({ endpoints, verificationMap, totalPages, loading: false });
    } catch {
      set({ loading: false });
      useToastStore.getState().error({ title: 'Error loading endpoints' });
    }
  },

  testEndpoint: async (_endpoint) => {
    // TODO: implement test logic
  },

  copyEndpoint: async (_endpoint) => {
    // TODO: implement copy logic
  },

  deleteEndpoint: async (endpoint) => {
    await api.post(deleteEndpointUrl(), { endpointId: endpoint.endpointId });
    set((state) => ({
      endpoints: state.endpoints.filter((e) => e.endpointId !== endpoint.endpointId),
    }));
  },

  addEndpointAfterCreate: (endpoint) => {
    set((state) => ({ endpoints: [endpoint, ...state.endpoints] }));
  },

  updateEndpointInList: (endpoint) => {
    set((state) => ({
      endpoints: state.endpoints.map((e) => (e.endpointId === endpoint.endpointId ? endpoint : e)),
    }));
  },
}));

export default useApiRegistryStore;
