import axios from 'axios';
import { create } from 'zustand';
import { v4 as uuid } from "uuid";
import { Edge, Node, ReactFlowInstance } from "reactflow";
import { EndpointData, EndpointEnv, EndpointTab, EndpointVariableData, PreDefinedEndpointEnvVariables } from 'types/endpoint';
import { getSecretVariables, getServiceById, getTaraAuthResponseVariables } from 'resources/api-constants';
import { Service, Step, StepType } from 'types';
import { RequestVariablesTabsRawData, RequestVariablesTabsRowsData } from 'types/request-variables';
import useToastStore from './toasts.store';
import i18next from 'i18next';
import { ROUTES } from 'resources/routes-constants';
import { NavigateFunction } from 'react-router-dom';
import { editServiceInfo, saveDraft, saveFlowClick } from 'services/service-builder';
import { initialEdge, initialNodes } from 'types/service-flow';

interface ServiceState {
  flow: string | undefined;
  endpoints: EndpointData[];
  name: string;
  serviceId: string;
  description: string;
  isCommon: boolean,
  edges: Edge[],
  nodes: Node[],
  isNewService: boolean,
  markAsNewService: () => void,
  unmarkAsNewService: () => void,
  setServiceId: (id: string) => void,
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[]| ((prev: Edge[]) => Edge[])) => void;
  vaildServiceInfo: () => boolean,
  setIsCommon: (isCommon: boolean) => void;
  secrets: PreDefinedEndpointEnvVariables;
  availableVariables: PreDefinedEndpointEnvVariables;
  serviceNameDashed: () => string;
  deleteEndpoint: (id: string) => void;
  isCommonEndpoint: (id: string) => boolean;
  setIsCommonEndpoint: (id: string, isCommon: boolean) => void;
  setDescription: (description: string) => void;
  setSecrets: (newSecrets: PreDefinedEndpointEnvVariables) => void;
  addProductionVariables: (variables: string[]) => void,
  addTestVariables: (variables: string[]) => void,
  changeServiceName: (name: string) => void;
  addEndpoint: () => void;
  loadSecretVariables: () => Promise<void>;
  loadTaraVariables: () => Promise<void>;
  loadService: (id?: string) => Promise<void>;
  getAvailableRequestValues: (endpointId: string) => PreDefinedEndpointEnvVariables;
  onNameChange: (endpointId: string, oldName: string, newName: string) => void;
  changeServiceEndpointType: (id: string, type: string) => void;
  mapEndpointsToSetps: () => Step[];
  selectedTab: EndpointEnv;
  setSelectedTab: (tab: EndpointEnv) => void;
  isLive: () => boolean;
  updateEndpointRawData: (rawData: RequestVariablesTabsRawData, endpointDataId?: string, parentEndpointId?: string) => void;
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpointDataId?: string, parentEndpointId?:string) => void;
  resetState: () => void;
  onContinueClick: (navigate: NavigateFunction) => Promise<void>;

  // TODO: remove the following funtions and refactor the code to use more specific functions
  setEndpoints: (callback: (prev: EndpointData[]) => EndpointData[]) => void;
  setFlow: (flow: string) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) => void;
}

const useServiceStore = create<ServiceState>((set, get, store) => ({
  flow: undefined,
  endpoints: [],
  name: '',
  serviceId: uuid(),
  description: '',
  edges: [],
  nodes: [],
  isNewService: true,
  markAsNewService: () => set({ isNewService: true }),
  unmarkAsNewService: () => set({ isNewService: false }),
  setServiceId: (id) => set({ serviceId: id }),
  setNodes: (nodes) => {
    if(nodes instanceof Function) {
      set(state => {
        return {
          nodes: nodes(state.nodes),
        }
      })
    } else {
      set({ nodes })
    }
  },
  setEdges: (edges) => {
    if(edges instanceof Function) {
      set(state => {
        return {
          edges: edges(state.edges),
        }
      })
    } else {
      set({ edges })
    }
  },
  secrets: { prod: [], test: [] },
  availableVariables: { prod: [], test: [] },
  vaildServiceInfo: () => !!get().name && !!get().description,
  serviceNameDashed: () => get().name.replace(" ", "-"),
  deleteEndpoint: (id: string) => {
    const newEndpoints = get().endpoints.filter((x) => x.id !== id);
    set({ endpoints: newEndpoints });
  },
  changeServiceName: (name: string) => set({ name }),
  setDescription: (description: string) => set({ description }),
  isCommon: false,
  setIsCommon: (isCommon: boolean) => set({ isCommon }),
  isCommonEndpoint: (id: string) => {
    const endpoint = get().endpoints.find(x => x.id === id);
    return endpoint?.isCommon ?? false;
  },
  setIsCommonEndpoint: (id: string, isCommon: boolean) => {
    const endpoints = get().endpoints.map(x => {
      if(x.id !== id) return x;
      return {
        ...x,
        isCommon,
      }
    })
    set({ endpoints })
  },
  setSecrets: (newSecrets: PreDefinedEndpointEnvVariables) => set({ secrets: newSecrets }),
  addProductionVariables: (variables: any) => {
    set(state => ({
      availableVariables: {
        prod: [ ...variables, ...state.availableVariables.prod ],
        test: state.availableVariables.test,
      }
    }))
  },
  addTestVariables: (variables: any) => {
    const prevVariables = get().availableVariables;
    set({
      availableVariables: {
        prod: prevVariables.prod,
        test: [ ...variables, ...prevVariables.test ],
      }
    })
  },
  addEndpoint: () => {
    const newEndpoint = { id: uuid(), name: "", definedEndpoints: [] };
    set(state => ({ endpoints:[ ...state.endpoints, newEndpoint] }));
  },
  resetState: () => {
    set({
      name: '',
      flow: undefined,
      endpoints: [],
      serviceId: uuid(),
      description: '',
      secrets: { prod: [], test: [] },
      availableVariables: { prod: [], test: [] },
      isCommon: false,
      reactFlowInstance: undefined,
      selectedTab: EndpointEnv.Live,
      isNewService: true,
    })
  },
  loadService: async (id) => {
    get().resetState();

    if(id) {
      const service = await axios.get<Service[]>(getServiceById(id));
      
      const structure = JSON.parse(service.data[0].structure.value);
      let endpoints = JSON.parse(service.data[0].endpoints.value);
      let edges = structure?.edges;
      let nodes = structure?.nodes;

      if(!edges || edges.length === 0)
        edges = [initialEdge];

      if(!nodes || nodes.length === 0)
        nodes = initialNodes;

      if(!endpoints || !(endpoints instanceof Array))
        endpoints = [];

      set({ 
        serviceId: id,
        name: service.data[0].name,
        isCommon : service.data[0].isCommon,
        description: service.data[0].description,
        edges,
        nodes,
        endpoints,
        isNewService: false,
      });
    }

    await get().loadSecretVariables();

    let nodes: Node[] = [];
    if(get().flow) {
      nodes = JSON.parse(get().flow!)?.nodes;
    }    
    if (nodes?.find((node) => node.data.stepType === "auth")) {
      await get().loadTaraVariables();
    }
    const variables = nodes?.filter((node) => node.data.stepType === "input")
      .map((node) => `{{ClientInput_${node.data.clientInputId}}}`);

    get().addProductionVariables(variables);
  },
  loadSecretVariables: async () => {
    const result = await axios.get(getSecretVariables());
    const data: { prod: string[]; test: string[] } = result.data;
    data.prod = data.prod.map((v) => `{{${v}}}`);
    data.test = data.test.filter(x => !data.prod.includes(x)).map((v) => `{{${v}}}`);
    
    if (!data) return;

    if (Object.keys(get().secrets).length === 0) {
      get().setSecrets(data);
    }

    get().addProductionVariables(data.prod);
    get().addTestVariables(data.test);
  },
  loadTaraVariables: async () => {
    const result = await axios.post(getTaraAuthResponseVariables());
    const data: { [key: string]: any } = result.data?.response?.body ?? {};
    const taraVariables = Object.keys(data).map(key => `{{TARA.${key}}}`);
    get().addProductionVariables(taraVariables);
  },
  getAvailableRequestValues: (endpointId: string) => {
    const variables = get().endpoints
      .filter(endpoint => endpoint.id !== endpointId)
      .map(endpoint => ({
        id: endpoint.id,
        name: endpoint.name,
        response: endpoint.definedEndpoints.find(x => x.isSelected)?.response ?? [],
      }))
      .flatMap(({id, name, response}) => response?.map(x => `{{${name === "" ? id : name}.${x.name}}}`));

    return {
        prod: [ ...variables, ...get().availableVariables.prod ],
        test: get().availableVariables.test,
    };
  },
  onNameChange: (endpointId: string, oldName: string, newName: string) => {
    const endpoint = get().endpoints.find(x => x.id === endpointId);
    const response = endpoint?.definedEndpoints.find(x => x.isSelected)?.response ?? [];
    const variables = response.map(x => `{{${!!newName ? newName : x.id}.${x.name}}}`);

    const oldFilteredVariables = get().availableVariables.prod.filter((v) => v.replace("{{", "").split(".")[0] !== oldName);

    const newEndpoints = get().endpoints.map(x => {
      if(x.id !== endpointId)
        return x;
      return {
        ...x,
        name: newName,
      };
    })

    set(state => ({
      endpoints: newEndpoints,
      availableVariables: {
        prod: [ ...variables, ...oldFilteredVariables ],
        test: state.availableVariables.test,
      }
    }));
  },
  changeServiceEndpointType: (id: string, type: string) => {
    const endpoints = get().endpoints.map(x => {
      if(x.id !== id) return x;
      return {
        ...x,
        type,
        definedEndpoints: [],
      }
    });

    set({ endpoints });
  },
  mapEndpointsToSetps: (): Step[] => {
    return get().endpoints.map(x => ({
        selected: x.definedEndpoints.find((e) => e.isSelected),
        endpoint: x,
    }))
    .filter(x => !!x.selected)
    .map(({selected, endpoint}, index) => ({
        id: index + 1,
        label:
          endpoint.name.trim().length > 0
            ? endpoint.name
            : `${selected!.methodType.toUpperCase()} ${selected!.url}`,
        type: StepType.UserDefined,
        data: endpoint,
      }));
  },
  setEndpoints: (callback) => {
    set(state => ({
      endpoints: callback(state.endpoints)
    }));
  },
  setFlow: (flow) => set({ flow }),

  selectedTab: EndpointEnv.Live,
  setSelectedTab: (tab: EndpointEnv) => set({ selectedTab: tab }),
  isLive: () => get().selectedTab === EndpointEnv.Live,
  updateEndpointRawData: (data: RequestVariablesTabsRawData, endpointId?: string, parentEndpointId?: string) => {
    if (!endpointId) return;
    set(state => {
      const isLive = state.isLive();
      const endpoints = state.endpoints.map((prevEndpoint: EndpointData) => {
        if (prevEndpoint.id !== parentEndpointId) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((defEndpoint) => {
          if (defEndpoint.id !== endpointId) return defEndpoint;
          Object.keys(data).forEach((key) => {
            if (defEndpoint[key as EndpointTab]) {
              defEndpoint[key as EndpointTab]!.rawData[isLive ? "value" : "testValue"] = data[key as EndpointTab];
            }
          });
          return defEndpoint;
        });
        return prevEndpoint;
      });

      return {
        endpoints
      }
    });
  },
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpointId?: string, parentEndpointId?: string) => {
    if (!endpointId) return;
    set((state) => {
      const endpoints = state.endpoints.map((prevEndpoint: EndpointData) => {
        if (prevEndpoint.id !== parentEndpointId) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((defEndpoint) => {
          if (defEndpoint.id !== endpointId) return defEndpoint;
          Object.keys(data).forEach((key) => {
            data[key as EndpointTab]?.forEach((row) => {
              if (
                !row.endpointVariableId &&
                row.variable &&
                !defEndpoint[key as EndpointTab]?.variables.map((e) => e.name).includes(row.variable)
              ) {
                const newVariable: EndpointVariableData = {
                  id: uuid(),
                  name: row.variable,
                  type: "custom",
                  required: false,
                };
                newVariable[state.isLive() ? "value" : "testValue"] = row.value;
                defEndpoint[key as EndpointTab]?.variables.push(newVariable);
              }
            });
            defEndpoint[key as EndpointTab]?.variables.forEach((variable) => {
              const updatedVariable = data[key as EndpointTab]!.find(
                (updated) => updated.endpointVariableId === variable.id
              );
              variable[state.isLive() ? "value" : "testValue"] = updatedVariable?.value;
              variable.name = updatedVariable?.variable ?? variable.name;
            });
          });
          return defEndpoint;
        });
        return prevEndpoint;
      });

      return {
        endpoints,
      }
    });
  },
  reactFlowInstance: null,
  setReactFlowInstance: (reactFlowInstance) => set({ reactFlowInstance, }),
  onContinueClick: async (navigate) => {
    const vaildServiceInfo = get().vaildServiceInfo();

    if (!vaildServiceInfo) {
      useToastStore.getState().error({
        title: i18next.t("newService.toast.missingFields"),
        message: i18next.t("newService.toast.serviceMissingFields"),
      });
      return;
    }

    if(get().isNewService) {
      await saveFlowClick(() => {});
      set({ 
        isNewService: false
      });
    } else {
      await editServiceInfo();
    }

    navigate(ROUTES.replaceWithId(ROUTES.FLOW_ROUTE, get().serviceId));
  },
}));

export default useServiceStore;
