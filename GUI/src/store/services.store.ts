import { PaginationState, SortingState } from '@tanstack/react-table';
import { changeServiceStatus, deleteService as deleteServiceApi, getServicesList } from 'resources/api-constants';
import { Service, ServiceState } from 'types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import useToastStore from './toasts.store';
import api from '../services/api-dev';

interface ServiceStoreState {
  services: Service[];
  commonServices: Service[];
  notCommonServices: Service[];
  orientation: 'horizontal' | 'vertical';
  toggleOrientation: () => void;
  autoView: boolean;
  toggleAutoView: () => void;
  loadServicesList: (pagination: PaginationState, sorting: SortingState) => Promise<void>;
  loadCommonServicesList: (pagination: PaginationState, sorting: SortingState) => Promise<void>;
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
      commonServices: [],
      notCommonServices: [],
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
      loadServicesList: async (pagination, sorting) => {
        const order = sorting[0]?.desc ? 'desc' : 'asc';
        const sort = sorting.length === 0 ? 'name asc' : sorting[0]?.id + ' ' + order;
        const result = await api.post(getServicesList(), {
          page: pagination.pageIndex + 1,
          page_size: pagination.pageSize,
          sorting: sort,
          is_common: false,
        });
        const services =
          result.data.response[0].map?.((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            slot: item.slot,
            state: item.state,
            type: item.type,
            isCommon: item.iscommon,
            serviceId: item.serviceId,
            usedCount: 0,
            totalPages: item.totalPages,
            endpoints: [],
            structure: item.structure,
          })) ?? [];
        set({
          notCommonServices: services,
        });
      },
      loadCommonServicesList: async (pagination, sorting) => {
        const order = sorting[0]?.desc ? 'desc' : 'asc';
        const sort = sorting.length === 0 ? 'id asc' : sorting[0]?.id + ' ' + order;
        const result = await api.post(getServicesList(), {
          page: pagination.pageIndex + 1,
          page_size: pagination.pageSize,
          sorting: sort,
          is_common: true,
        });
        const services =
          result.data.response[0].map?.((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            state: item.state,
            type: item.type,
            isCommon: item.iscommon,
            serviceId: item.serviceId,
            totalPages: item.totalPages,
            usedCount: 0,
            endpoints: [],
            slot: '',
            structure: item.structure,
          })) ?? [];

        set({
          commonServices: services,
        });
      },
      deleteService: (id) => {
        const services = get().services.filter((e: Service) => e.serviceId !== id);
        set({
          commonServices: services.filter((e: Service) => e.isCommon),
          notCommonServices: services.filter((e: Service) => !e.isCommon),
        });
      },
      selectedService: undefined,
      setSelectedService: (service: Service) => {
        set({
          selectedService: service,
        });
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
          await useServiceListStore.getState().loadCommonServicesList(pagination, sorting);
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
