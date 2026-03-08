import { PaginationState, SortingState } from '@tanstack/react-table';
import {
  createEndpoint,
  deleteEndpoint as deleteEndpointApi,
  getCommonEndpoints,
  getEndpointValidation,
} from 'resources/api-constants';
import { EndpointData } from 'types/endpoint';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';

import useToastStore from './toasts.store';
import api from '../services/api-dev';


export type VerificationStatus = 'verified' | 'failed' | 'unverified';

export interface VerificationMetadata {
  lastTestAt: string | null;
  verificationStatus: VerificationStatus;
  lastStatusCode?: number;
  schemaCaptured?: boolean;
}

interface ApiRegistryState {
  endpoints: EndpointData[];
  totalPages: number;
  verificationMap: Record<string, VerificationMetadata>;
  loading: boolean;
  loadEndpoints: (pagination: PaginationState, sorting: SortingState, search: string) => Promise<void>;
  setVerification: (endpointId: string, data: Partial<VerificationMetadata>) => void;
  testEndpoint: (endpoint: EndpointData) => Promise<{ success: boolean; statusCode?: number }>;
  copyEndpoint: (endpoint: EndpointData) => Promise<void>;
  deleteEndpoint: (endpoint: EndpointData) => Promise<void>;
  addEndpointAfterCreate: (endpoint: EndpointData) => void;
  updateEndpointInList: (endpoint: EndpointData) => void;
}

const initialVerification = (): VerificationMetadata => ({
  lastTestAt: null,
  verificationStatus: 'unverified',
  schemaCaptured: false,
});

const useApiRegistryStore = create<ApiRegistryState>((set, get) => ({
  endpoints: [],
  totalPages: 1,
  verificationMap: {},
  loading: true,

  loadEndpoints: async (pagination, sorting, search) => {
    set({ loading: true });
    try {
      const order = sorting[0]?.desc ? 'desc' : 'asc';
      const sort = sorting.length > 0 ? `${sorting[0].id} ${order}` : 'created_at desc';
      const response = await api.post(getCommonEndpoints(), {
        pagination: true,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sorting: sort,
        search: search || undefined,
      });
      const data = response.data?.response;
      let endpoints: EndpointData[] = [];
      let totalPages = 1;
      const rawList = Array.isArray(data) ? data : (data?.content ?? []);
      endpoints = rawList.map((item: any) => {
        const defs = item.definitions;
        const parsed = typeof defs?.value === 'string' ? JSON.parse(defs.value) : Array.isArray(defs) ? defs : [];
        return {
          ...item,
          definitions: parsed,
        };
      });
      totalPages = rawList[0]?.totalPages ?? data?.totalPages ?? 1;
      set({ endpoints, totalPages });
    } catch (e) {
      console.error('Failed to load API registry endpoints', e);
      set({ endpoints: [], totalPages: 1 });
    } finally {
      set({ loading: false });
    }
  },

  setVerification: (endpointId, data) => {
    set((state) => ({
      verificationMap: {
        ...state.verificationMap,
        [endpointId]: {
          ...initialVerification(),
          ...state.verificationMap[endpointId],
          ...data,
        },
      },
    }));
  },

  testEndpoint: async (endpoint) => {
    const def = endpoint.definitions?.[0];
    if (!def?.url) {
      return { success: false };
    }
    try {
      new URL(def.url);
      const type = def.methodType === 'GET' ? 'GET' : 'POST';
      const res = await api.post(getEndpointValidation(), { url: def.url, type });
      const statusCode = res?.data?.statusCode ?? res?.status ?? 200;
      const success = statusCode >= 200 && statusCode < 300;
      const now = new Date().toISOString();
      const hasSchema = !!(def.response && Array.isArray(def.response) && def.response.length > 0);
      get().setVerification(endpoint.endpointId, {
        lastTestAt: now,
        verificationStatus: success ? 'verified' : 'failed',
        lastStatusCode: statusCode,
        schemaCaptured:
          success && statusCode !== 204
            ? hasSchema
            : (get().verificationMap[endpoint.endpointId]?.schemaCaptured ?? false),
      });
      return { success, statusCode };
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const now = new Date().toISOString();
      get().setVerification(endpoint.endpointId, {
        lastTestAt: now,
        verificationStatus: 'failed',
        lastStatusCode: statusCode,
        schemaCaptured: get().verificationMap[endpoint.endpointId]?.schemaCaptured ?? false,
      });
      return { success: false, statusCode };
    }
  },

  copyEndpoint: async (endpoint) => {
    const def = endpoint.definitions?.[0];
    const label = def?.label ?? endpoint.name ?? 'Endpoint';
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}_${pad(now.getMonth() + 1)}-${now.getFullYear()}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const newName = `${label}_${dateStr}`.replace(/\s+/g, '_');
    const newEndpoint: EndpointData = {
      ...JSON.parse(JSON.stringify(endpoint)),
      endpointId: uuid(),
      name: newName,
      isNew: true,
      definitions: endpoint.definitions.map((d) => ({ ...d, id: uuid(), label: newName })),
    };
    try {
      await api.post(createEndpoint(), {
        ...newEndpoint,
        definitions: JSON.stringify(newEndpoint.definitions),
      });
      newEndpoint.isNew = false;
      get().addEndpointAfterCreate(newEndpoint);
      useToastStore.getState().success({ title: 'Endpoint copied' });
    } catch (e) {
      console.error(e);
      useToastStore.getState().error({ title: 'Failed to copy endpoint' });
    }
  },

  deleteEndpoint: async (endpoint) => {
    try {
      await api.post(deleteEndpointApi(), { id: endpoint.endpointId });
      const { verificationMap } = get();
      const next = { ...verificationMap };
      delete next[endpoint.endpointId];
      set((state) => ({
        endpoints: state.endpoints.filter((e) => e.endpointId !== endpoint.endpointId),
        verificationMap: next,
      }));
      useToastStore.getState().success({ title: 'Endpoint deleted' });
    } catch (e) {
      console.error(e);
      useToastStore.getState().error({ title: 'Failed to delete endpoint' });
    }
  },

  addEndpointAfterCreate: (endpoint) => {
    set((state) => ({
      endpoints: [endpoint, ...state.endpoints],
    }));
  },

  updateEndpointInList: (endpoint) => {
    set((state) => ({
      endpoints: state.endpoints.map((e) => (e.endpointId === endpoint.endpointId ? { ...endpoint, isNew: false } : e)),
    }));
  },
}));

export default useApiRegistryStore;
