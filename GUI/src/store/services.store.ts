import { PaginationState, SortingState } from '@tanstack/react-table';
import { Node } from '@xyflow/react';
import i18n from 'i18n';
import {
  changeServiceStatus,
  deleteService as deleteServiceApi,
  getServiceById,
  getServiceDependencies,
  getServicesOverview,
  locateService as locateServiceApi,
  pinService as pinServiceApi,
  unpinService as unpinServiceApi,
} from 'resources/api-constants';
import { Service, ServiceState } from 'types';
import { ActivationBlocker } from 'types/activation-blocker';
import { ServiceDependency, ServiceLocation } from 'types/service-dependency';
import { findActivationBlockers, ServiceFlowLookup } from 'utils/service-activation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import useToastStore from './toasts.store';
import api from '../services/api-dev';

const fetchServiceFlow = async (serviceId: string): Promise<ServiceFlowLookup | undefined> => {
  try {
    const response = await api.post<Service>(getServiceById(), { id: serviceId, search: '' });
    const data = response.data;
    if (!data?.serviceId) return undefined;

    const structure = JSON.parse(data.structure?.value ?? '{}');
    return { name: data.name, state: data.state, nodes: (structure?.nodes ?? []) as Node[] };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export interface ServicesFilters {
  readonly search: string;
  readonly state: string;
  readonly dependencies: 'all' | 'yes' | 'no';
}

export const DEFAULT_SERVICES_FILTERS: ServicesFilters = { search: '', state: '', dependencies: 'all' };

const toSortingParam = (sorting: SortingState): string => {
  if (sorting.length === 0) return '';
  const order = sorting[0].desc ? 'desc' : 'asc';
  return `${sorting[0].id} ${order}`;
};

const mapService = (item: any, isPinned: boolean): Service => ({
  id: item.id,
  name: item.name,
  description: item.description,
  examples: item.examples ?? [],
  entities: item.entities ?? [],
  slot: item.slot,
  state: item.state,
  type: item.type,
  serviceId: item.serviceId,
  totalPages: item.totalPages ?? 1,
  totalCount: item.totalCount ?? 0,
  indexStatus: item.indexStatus ?? null,
  incomingCount: item.incomingCount ?? 0,
  outgoingCount: item.outgoingCount ?? 0,
  problemCount: item.problemCount ?? 0,
  isPinned,
  endpoints: [],
});

interface ServiceStoreState {
  services: Service[];
  pinnedServices: Service[];
  servicesTotalCount: number;
  servicesTotalPages: number;
  servicesPagination: PaginationState;
  servicesSorting: SortingState;
  servicesFilters: ServicesFilters;
  /** Incremented after every list load so dependent views (e.g. dependency panels) can refresh. */
  servicesVersion: number;
  orientation: 'horizontal' | 'vertical';
  toggleOrientation: () => void;
  autoView: boolean;
  toggleAutoView: () => void;
  loadServicesList: (pagination: PaginationState, sorting: SortingState, filters?: ServicesFilters) => Promise<void>;
  togglePinService: (service: Service) => Promise<void>;
  loadServiceDependencies: (serviceId: string) => Promise<ServiceDependency[]>;
  locateService: (
    serviceId: string,
    pageSize: number,
    sorting: SortingState,
    filters: ServicesFilters,
  ) => Promise<ServiceLocation | undefined>;
  selectedService: Service | undefined;
  setSelectedService: (service: Service) => void;
  loadActivationBlockers: (service: Service) => Promise<ActivationBlocker[]>;
  changeServiceState: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    activate: boolean,
    draft: boolean,
    pagination: PaginationState,
    sorting: SortingState,
  ) => Promise<void>;
  deleteSelectedService: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    pagination: PaginationState,
    sorting: SortingState,
  ) => Promise<void>;
}

const useServiceListStore = create<ServiceStoreState>()(
  persist(
    (set, get) => ({
      services: [],
      pinnedServices: [],
      servicesTotalCount: 0,
      servicesTotalPages: 1,
      servicesPagination: { pageIndex: 0, pageSize: 10 },
      servicesSorting: [],
      servicesFilters: DEFAULT_SERVICES_FILTERS,
      servicesVersion: 0,
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
      loadServicesList: async (pagination, sorting, filters = get().servicesFilters) => {
        const result = await api.post(getServicesOverview(), {
          page: pagination.pageIndex + 1,
          page_size: pagination.pageSize,
          sorting: toSortingParam(sorting),
          search: filters.search,
          state: filters.state,
          dependencies: filters.dependencies,
        });
        const response = result.data.response ?? {};
        const services: Service[] = (response.services ?? []).map((item: any) => mapService(item, false));
        const pinnedServices: Service[] = (response.pinned ?? []).map((item: any) => mapService(item, true));
        set({
          services,
          pinnedServices,
          servicesTotalCount: services[0]?.totalCount ?? 0,
          servicesTotalPages: Math.max(services[0]?.totalPages ?? 1, 1),
          servicesPagination: pagination,
          servicesSorting: sorting,
          servicesFilters: filters,
          servicesVersion: get().servicesVersion + 1,
        });
      },
      loadServiceDependencies: async (serviceId) => {
        const result = await api.post(getServiceDependencies(), { service_id: serviceId });
        return (result.data.response ?? []).map((item: any): ServiceDependency => ({
          direction: item.direction,
          serviceId: item.serviceId,
          name: item.name,
          state: item.state ?? null,
          type: item.type ?? null,
          deleted: !!item.deleted,
          incomingCount: item.incomingCount ?? 0,
          outgoingCount: item.outgoingCount ?? 0,
        }));
      },
      locateService: async (serviceId, pageSize, sorting, filters) => {
        const result = await api.post(locateServiceApi(), {
          service_id: serviceId,
          page_size: pageSize,
          sorting: toSortingParam(sorting),
          search: filters.search,
          state: filters.state,
          dependencies: filters.dependencies,
        });
        const location = result.data.response;
        if (!location?.serviceId) return undefined;
        return {
          serviceId: location.serviceId,
          pinned: !!location.pinned,
          page: location.page == null ? null : Number(location.page),
        };
      },
      togglePinService: async (service) => {
        const { servicesPagination, servicesSorting, pinnedServices, services } = get();
        const pin = !service.isPinned;
        // Optimistic update so the row moves immediately; the reload below settles order and counts.
        set({
          pinnedServices: pin
            ? [...pinnedServices, { ...service, isPinned: true }]
            : pinnedServices.filter((s) => s.serviceId !== service.serviceId),
          services: pin ? services.filter((s) => s.serviceId !== service.serviceId) : services,
        });
        try {
          await api.post(pin ? pinServiceApi() : unpinServiceApi(), { service_id: service.serviceId });
        } catch (error) {
          console.error(error);
          useToastStore.getState().error({ title: i18n.t('overview.service.toast.failed.pin') });
        }
        await get().loadServicesList(servicesPagination, servicesSorting);
      },
      selectedService: undefined,
      setSelectedService: (service: Service) => {
        set({
          selectedService: service,
        });
      },
      loadActivationBlockers: async (service: Service) => {
        const rootFlow = await fetchServiceFlow(service.serviceId);
        if (!rootFlow) return [];
        return findActivationBlockers(rootFlow.nodes, fetchServiceFlow);
      },
      changeServiceState: async (onEnd, successMessage, errorMessage, activate, draft, pagination, sorting) => {
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
          await useServiceListStore.getState().loadServicesList(pagination, sorting);
        } catch (error) {
          console.error(error);
          useToastStore.getState().error({ title: errorMessage });
          throw error;
        }
        set({
          selectedService: undefined,
        });
        onEnd();
      },
      deleteSelectedService: async (onEnd, successMessage, errorMessage) => {
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
        set({
          selectedService: undefined,
        });
        onEnd();
      },
    }),
    {
      name: 'state-configs',
      partialize: (state) => ({ orientation: state.orientation, autoView: state.autoView }),
    },
  ),
);

export default useServiceListStore;
