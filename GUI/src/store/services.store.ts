import { create } from "zustand";
import axios from "axios";
import {
  changeIntentConnection,
  changeServiceStatus,
  deleteService as deleteServiceApi,
  getAvailableIntents,
  getCommonServicesList,
  getConnectionRequests,
  getServicesList,
  requestServiceIntentConnection,
  respondToConnectionRequest,
} from "resources/api-constants";
import { Service, ServiceState } from "types";
import useToastStore from "./toasts.store";
import { Trigger } from "types/Trigger";
import { Intent } from "types/Intent";
import { PaginationState, SortingState } from "@tanstack/react-table";

interface ServiceStoreState {
  services: Service[];
  commonServices: Service[];
  notCommonServices: Service[];
  loadServicesList: (pagination: PaginationState, sorting: SortingState) => Promise<void>;
  loadCommonServicesList: (pagination: PaginationState, sorting: SortingState) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  selectedService: Service | undefined;
  setSelectedService: (service: Service) => void;
  changeServiceState: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    activate: boolean,
    draft: boolean,
    pagination: PaginationState,
    sorting: SortingState
  ) => Promise<void>;
  checkServiceIntentConnection: (onConnected: (response: Trigger) => void, onNotConnected: () => void) => Promise<void>;
  deleteSelectedService: (onEnd: () => void, successMessage: string, errorMessage: string) => Promise<void>;
  requestServiceIntentConnection: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    intent: string,
    pagination: PaginationState,
    sorting: SortingState
  ) => Promise<void>;
  loadRequestsList: (
    onEnd: (requests: Trigger[]) => void,
    errorMessage: string,
    pagination: PaginationState,
    sorting: SortingState
  ) => Promise<void>;
  loadAvailableIntentsList: (
    onEnd: (requests: Intent[]) => void,
    errorMessage: string,
    pagination: PaginationState,
    sorting: SortingState
  ) => Promise<void>;
  respondToConnectionRequest: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    status: boolean,
    request: Trigger
  ) => Promise<void>;
  cancelConnectionRequest: (
    onEnd: () => void,
    successMessage: string,
    errorMessage: string,
    request: Trigger
  ) => Promise<void>;
}

const useServiceListStore = create<ServiceStoreState>((set, get, store) => ({
  services: [],
  commonServices: [],
  notCommonServices: [],
  loadServicesList: async (pagination, sorting) => {
    const order = sorting[0]?.desc ? "desc" : "asc";
    const sort = sorting.length === 0 ? "id asc" : sorting[0]?.id + " " + order;
    const result = await axios.post(getServicesList(), {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
      sorting: sort,
    });
    const triggers = result.data.response[1];
    const services =
      result.data.response[0].map?.(
        (item: any) =>
          ({
            id: item.id,
            name: item.name,
            description: item.description,
            state: item.state,
            type: item.type,
            isCommon: item.iscommon,
            serviceId: item.serviceId,
            usedCount: 0,
            totalPages: item.totalPages,
            linkedIntent: triggers.find((e: Trigger) => e.service === item.serviceId)?.intent || "",
          } as Service)
      ) || [];

    set({
      notCommonServices: services,
    });
  },
  loadCommonServicesList: async (pagination, sorting) => {
    const order = sorting[0]?.desc ? "desc" : "asc";
    const sort = sorting.length === 0 ? "id asc" : sorting[0]?.id + " " + order;
    const result = await axios.post(getCommonServicesList(), {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
      sorting: sort,
    });
    const triggers = result.data.response[1];
    const services =
      result.data.response[0].map?.(
        (item: any) =>
          ({
            id: item.id,
            name: item.name,
            description: item.description,
            state: item.state,
            type: item.type,
            isCommon: item.iscommon,
            serviceId: item.serviceId,
            totalPages: item.totalPages,
            usedCount: 0,
            linkedIntent: triggers.find((e: Trigger) => e.service === item.serviceId)?.intent || "",
          } as Service)
      ) || [];

    set({
      commonServices: services,
    });
  },
  deleteService: async (id) => {
    const services = get().services.filter((e: Service) => e.serviceId !== id);
    set({
      commonServices: services.filter((e: Service) => e.isCommon === true),
      notCommonServices: services.filter((e: Service) => e.isCommon === false),
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

      await axios.post(changeServiceStatus(), {
        id: selectedService.serviceId,
        state,
        type: selectedService.type,
      });
      useToastStore.getState().success({ title: successMessage });
      await useServiceListStore.getState().loadServicesList(pagination, sorting);
      await useServiceListStore.getState().loadCommonServicesList(pagination, sorting);
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    set({
      selectedService: undefined,
    });
    onEnd();
  },
  checkServiceIntentConnection: async (onConnected, onNotConnected) => {
    const selectedService = get().selectedService;
    if (!selectedService) return;

    try {
      const res = await axios.post(changeIntentConnection(), {
        serviceId: selectedService.serviceId,
      });
      if (res.data.response) {
        onConnected(res.data.response);
      } else {
        onNotConnected();
      }
    } catch (_) {
      onNotConnected();
    }
  },
  deleteSelectedService: async (onEnd, successMessage, errorMessage) => {
    const selectedService = get().selectedService;
    if (!selectedService) return;

    try {
      await axios.post(deleteServiceApi(), {
        id: selectedService?.serviceId,
        type: selectedService?.type,
      });
      useToastStore.getState().success({ title: successMessage });
      await useServiceListStore.getState().loadServicesList({ pageIndex: 0, pageSize: 10 }, []);
      await useServiceListStore.getState().loadCommonServicesList({ pageIndex: 0, pageSize: 10 }, []);
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    set({
      selectedService: undefined,
    });
    onEnd();
  },
  requestServiceIntentConnection: async (onEnd, successMessage, errorMessage, intent, pagination, sorting) => {
    const selectedService = get().selectedService;
    if (!selectedService) return;

    try {
      await axios.post(requestServiceIntentConnection(), {
        serviceId: selectedService.serviceId,
        serviceName: selectedService.name,
        serviceMethod: selectedService.type,
        serviceSlot: selectedService.slot,
        intent: intent,
      });
      useToastStore.getState().success({ title: successMessage });
      await useServiceListStore.getState().loadServicesList(pagination, sorting);
      await useServiceListStore.getState().loadCommonServicesList(pagination, sorting);
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    onEnd();
  },
  loadRequestsList: async (onEnd, errorMessage, pagination, sorting) => {
    try {
      const order = sorting[0]?.desc ? "desc" : "asc";
      const sort = sorting.length === 0 ? "requestedAt desc" : sorting[0]?.id + " " + order;
      const requests = await axios.post(getConnectionRequests(), {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sorting: sort,
      });
      onEnd(requests.data.response);
    } catch (_) {
      onEnd([]);
      useToastStore.getState().error({ title: errorMessage });
    }
  },
  loadAvailableIntentsList: async (onEnd, errorMessage, pagination, sorting) => {
    try {
      const order = sorting[0]?.desc ? "desc" : "asc";
      const sort = sorting.length === 0 ? "intent asc" : sorting[0]?.id + " " + order;
      const requests = await axios.post(getAvailableIntents(), {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sorting: sort,
      });
      onEnd(requests.data.response);
    } catch (_) {
      onEnd([]);
      useToastStore.getState().error({ title: errorMessage });
    }
  },
  respondToConnectionRequest: async (onEnd, successMessage, errorMessage, status, request) => {
    try {
      await axios.post(respondToConnectionRequest(), {
        serviceId: request.service,
        serviceName: request.serviceName,
        serviceMethod: "POST",
        intent: request.intent,
        authorRole: request.authorRole,
        status: status === true ? "approved" : "declined",
      });
      useToastStore.getState().success({ title: successMessage });
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    onEnd();
  },
  cancelConnectionRequest: async (onEnd, successMessage, errorMessage, request) => {
    try {
      await axios.post(respondToConnectionRequest(), {
        serviceId: request.service,
        serviceName: request.serviceName,
        serviceMethod: "POST",
        intent: request.intent,
        authorRole: request.authorRole,
        status: "deleted",
      });
      useToastStore.getState().success({ title: successMessage });
    } catch (_) {
      useToastStore.getState().error({ title: errorMessage });
    }
    onEnd();
  },
}));

export default useServiceListStore;
