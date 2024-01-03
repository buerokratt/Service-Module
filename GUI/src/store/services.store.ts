import { create } from 'zustand';
import axios from 'axios';
import { getServicesList } from 'resources/api-constants';
import { Service } from 'types';

interface ServiceState {
  services: Service[];
  commonServices: Service[];
  notCommonServices: Service[];
  loadServicesList: () => Promise<void>;
  deleteService: (id: number) => Promise<void>;
}

const useServiceListStore = create<ServiceState>((set, get, store) => ({
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
}));

export default useServiceListStore;
