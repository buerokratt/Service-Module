import { PaginationState, SortingState } from '@tanstack/react-table';
import {
  changeServiceStatus,
  deleteService as deleteServiceApi,
  getServicesDependencyData,
  getServicesList,
} from 'resources/api-constants';
import { Service, ServiceState } from 'types';
import { buildServiceDependencyMap, ServiceDependencyMap } from 'utils/service-dependencies';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import useToastStore from './toasts.store';
import api from '../services/api-dev';

interface ServiceStoreState {
  services: Service[];
  dependencyMap: ServiceDependencyMap;
  servicesPagination: PaginationState;
  servicesSorting: SortingState;
  searchQuery: string;
  expandedServiceIds: string[];
  focusedServiceId: string | null;
  orientation: 'horizontal' | 'vertical';
  toggleOrientation: () => void;
  autoView: boolean;
  toggleAutoView: () => void;
  loadServicesList: (pagination: PaginationState, sorting: SortingState, search?: string) => Promise<void>;
  loadDependencyMap: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setExpandedServiceIds: (ids: string[]) => void;
  setFocusedServiceId: (id: string | null) => void;
  toggleDependencyView: (serviceId: string) => void;
  focusDependencyView: (serviceId: string) => void;
  deleteService: (id: string) => void;
  selectedService: Service | undefined;
  setSelectedService: (service: Service) => void;
  changeServiceState: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    activate: boolean,
    draft: boolean,
    pagination: PaginationState,
    sorting: SortingState,
    search?: string,
  ) => Promise<void>;
  deleteSelectedService: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    pagination: PaginationState,
    sorting: SortingState,
    search?: string,
  ) => Promise<void>;
}

const mapServiceItem = (item: Record<string, unknown>): Service => ({
  id: item.id as number,
  name: item.name as string,
  description: item.description as string | undefined,
  slot: (item.slot as string) ?? '',
  state: item.state as ServiceState,
  type: item.type as 'GET' | 'POST',
  isCommon: Boolean(item.iscommon ?? item.is_common),
  serviceId: item.serviceId as string,
  examples: (item.examples as string[]) ?? [],
  entities: (item.entities as string[]) ?? [],
  totalPages: item.totalPages as number,
  endpoints: [],
});

const useServiceListStore = create<ServiceStoreState>()(
  persist(
    (set, get) => ({
      services: [],
      dependencyMap: {},
      servicesPagination: { pageIndex: 0, pageSize: 10 },
      servicesSorting: [{ id: 'id', desc: false }],
      searchQuery: '',
      expandedServiceIds: [],
      focusedServiceId: null,
      orientation: 'vertical',
      autoView: false,
      toggleAutoView: () =>
        set((state) => ({
          autoView: !state.autoView,
        })),
      toggleOrientation: () =>
        set((state) => ({
          orientation: state.orientation === 'horizontal' ? 'vertical' : 'horizontal',
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setExpandedServiceIds: (ids) => set({ expandedServiceIds: ids }),
      setFocusedServiceId: (id) => set({ focusedServiceId: id }),
      toggleDependencyView: (serviceId) => {
        const { expandedServiceIds, focusedServiceId } = get();
        const isExpanded = expandedServiceIds.includes(serviceId);
        const isOnlyFocused = focusedServiceId === serviceId && expandedServiceIds.length === 1 && isExpanded;

        if (isOnlyFocused) {
          set({ expandedServiceIds: [], focusedServiceId: null });
          return;
        }

        if (isExpanded && focusedServiceId === serviceId) {
          set({ expandedServiceIds: [serviceId], focusedServiceId: serviceId });
          return;
        }

        set({
          expandedServiceIds: isExpanded ? expandedServiceIds : [...expandedServiceIds, serviceId],
          focusedServiceId: serviceId,
        });
      },
      focusDependencyView: (serviceId) => {
        const { expandedServiceIds } = get();
        set({
          expandedServiceIds: expandedServiceIds.includes(serviceId)
            ? expandedServiceIds
            : [...expandedServiceIds, serviceId],
          focusedServiceId: serviceId,
        });
      },
      loadServicesList: async (pagination, sorting, search) => {
        const order = sorting[0]?.desc ? 'desc' : 'asc';
        const sort = sorting.length === 0 ? 'id asc' : sorting[0]?.id + ' ' + order;
        const searchQuery = search ?? get().searchQuery;
        const result = await api.post(getServicesList(), {
          page: pagination.pageIndex + 1,
          page_size: pagination.pageSize,
          sorting: sort,
          is_common: '',
          search: searchQuery,
        });
        const services = result.data.response[0].map?.((item: Record<string, unknown>) => mapServiceItem(item)) ?? [];
        set({
          services,
          servicesPagination: pagination,
          servicesSorting: sorting,
          searchQuery,
        });
      },
      loadDependencyMap: async () => {
        try {
          const result = await api.get(getServicesDependencyData());
          const rawServices = (Array.isArray(result.data) ? result.data : []).map((item: Record<string, unknown>) => ({
            serviceId: item.service_id as string,
            name: item.name as string,
            state: item.state as string,
            isCommon: Boolean(item.is_common),
            structure: item.structure as { value?: string },
          }));
          set({ dependencyMap: buildServiceDependencyMap(rawServices) });
        } catch (error) {
          console.error(error);
        }
      },
      deleteService: (id) => {
        set({ services: get().services.filter((e: Service) => e.serviceId !== id) });
      },
      selectedService: undefined,
      setSelectedService: (service: Service) => {
        set({ selectedService: service });
      },
      changeServiceState: async (onEnd, successMessage, errorMessage, activate, draft, pagination, sorting, search) => {
        const selectedService = get().selectedService;
        if (!selectedService) return;

        try {
          let state;
          if (selectedService.state === ServiceState.Active && !draft) state = ServiceState.Inactive;
          else if (selectedService.state === ServiceState.Active && draft) state = ServiceState.Draft;
          else if (selectedService.state === ServiceState.Draft) state = ServiceState.Ready;
          else if (
            (selectedService.state === ServiceState.Ready && activate) ||
            (selectedService.state === ServiceState.Inactive && !draft)
          )
            state = ServiceState.Active;
          else state = ServiceState.Draft;

          await api.post(changeServiceStatus(), {
            id: selectedService.serviceId,
            state,
            type: selectedService.type,
          });
          useToastStore.getState().success({ title: successMessage });
          await useServiceListStore.getState().loadServicesList(pagination, sorting, search);
          await useServiceListStore.getState().loadDependencyMap();
        } catch (error) {
          console.error(error);
          useToastStore.getState().error({ title: errorMessage });
          throw error;
        }
        set({ selectedService: undefined });
        onEnd();
      },
      deleteSelectedService: async (onEnd, successMessage, errorMessage, pagination, sorting, search) => {
        const selectedService = get().selectedService;
        if (!selectedService) return;

        try {
          await api.post(deleteServiceApi(), {
            id: selectedService?.serviceId,
            type: selectedService?.type,
          });
          useToastStore.getState().success({ title: successMessage });
        } catch (error) {
          useToastStore.getState().error({ title: errorMessage });
          throw error;
        }
        set({ selectedService: undefined });
        onEnd();
        await useServiceListStore.getState().loadServicesList(pagination, sorting, search);
        await useServiceListStore.getState().loadDependencyMap();
      },
    }),
    {
      name: 'state-configs',
      partialize: (state) => ({ orientation: state.orientation, autoView: state.autoView }),
    },
  ),
);

export default useServiceListStore;
