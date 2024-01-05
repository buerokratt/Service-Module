import { create } from 'zustand';
import axios from 'axios';
import { changeServiceStatus, deleteService, getServicesList } from 'resources/api-constants';
import { Service, ServiceState } from 'types';
import useToastStore from './toasts.store';

interface ServiceStoreState {
  services: Service[];
  commonServices: Service[];
  notCommonServices: Service[];
  loadServicesList: () => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  selectedService: Service | undefined;
  setSelectedService: (service: Service) => void;
  changeServiceState: (onEnd: () => void, successMessage: string, errorMessage: string) => Promise<void>;
  deleteSelectedService: (onEnd: () => void, successMessage: string, errorMessage: string) => Promise<void>;
}

const useServiceListStore = create<ServiceStoreState>((set, get, store) => ({
  services: [],
  commonServices: [],
  notCommonServices: [],
  loadServicesList: async () => {
    const result = await axios.get(getServicesList());
    const services = result.data.response.map((item: any) => ({
        id: item.id,
        name: item.name,
        state: item.state,
        type: item.type,
        isCommon: item.iscommon,
        usedCount: 0,
      } as Service));

    set({
      services,
      commonServices: services.filter((e: Service) => e.isCommon === true),
      notCommonServices: services.filter((e: Service) => e.isCommon === false),
    })
  },
  deleteService: async (id: number) => {
    // TODO later:
    // await axios.delete(`${getServicesList()}/${id}`);
    const services = get().services.filter((e: Service) => e.id !== id);
    set({
      services,
      commonServices: services.filter((e: Service) => e.isCommon === true),
      notCommonServices: services.filter((e: Service) => e.isCommon === false),
    })
  },

  selectedService: undefined,
  setSelectedService: (service: Service) => {
    set({
      selectedService: service,
    });
  },
  changeServiceState: async (onEnd, successMessage, errorMessage) => {
    const selectedService = get().selectedService;
    if (!selectedService) return;

    try {
      await axios.post(changeServiceStatus(), {
        id: selectedService.id,
        state: selectedService.state === ServiceState.Active ? ServiceState.Inactive : ServiceState.Active,
        type: selectedService.type,
      });
      useToastStore.getState().success({ title: successMessage });
      await useServiceListStore.getState().loadServicesList();
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
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
      await axios.post(deleteService(), {
        id: selectedService?.id,
        type: selectedService?.type,
      });
      useToastStore.getState().success({ title: successMessage});
      await useServiceListStore.getState().deleteService(selectedService.id);
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    set({
      selectedService: undefined,
    });
    onEnd();
  },
}));

export default useServiceListStore;