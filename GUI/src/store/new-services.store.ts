import axios from 'axios';
import { create } from 'zustand';
import { v4 as uuid } from "uuid";
import { Edge, EdgeChange, Node, NodeChange, ReactFlowInstance, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { EndpointData, EndpointEnv, EndpointTab, EndpointVariableData, PreDefinedEndpointEnvVariables } from 'types/endpoint';
import { getSecretVariables, getServiceById, getTaraAuthResponseVariables } from 'resources/api-constants';
import { Service, ServiceState, Step, StepType } from 'types';
import { RequestVariablesTabsRawData, RequestVariablesTabsRowsData } from 'types/request-variables';
import useToastStore from './toasts.store';
import i18next from 'i18next';
import { ROUTES } from 'resources/routes-constants';
import { NavigateFunction } from 'react-router-dom';
import { editServiceInfo, saveFlowClick } from 'services/service-builder';
import { GRID_UNIT, NodeDataProps, initialEdge, initialNodes } from 'types/service-flow';
import { alignNodesInCaseAnyGotOverlapped, buildEdge, buildPlaceholder, updateFlowInputRules } from 'services/flow-builder';

interface ServiceStoreState {
  endpoints: EndpointData[];
  name: string;
  serviceId: string;
  description: string;
  isCommon: boolean,
  edges: Edge[],
  nodes: Node[],
  isNewService: boolean,
  serviceState: ServiceState;
  markAsNewService: () => void,
  unmarkAsNewService: () => void,
  setServiceId: (id: string) => void,
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[]| ((prev: Edge[]) => Edge[])) => void;
  vaildServiceInfo: () => boolean,
  setIsCommon: (isCommon: boolean) => void;
  secrets: PreDefinedEndpointEnvVariables;
  availableVariables: PreDefinedEndpointEnvVariables;
  isTestButtonVisible: boolean;
  isSaveButtonEnabled: () => boolean;
  getFlatVariables: () => string[];
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
  selectedNode: Node<NodeDataProps> | null;
  setSelectedNode: (node: Node<NodeDataProps> | null | undefined) => void;
  handleNodeEdit: (selectedNodeId: string) => void;
  onDelete: (id: string, shouldAddPlaceholder: boolean) => void;
  clickedNode: any;
  setClickedNode: (clickedNode: any) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isTestButtonEnabled: boolean;
  disableTestButton: () => void;
  enableTestButton: () => void;

  // TODO: remove the following funtions and refactor the code to use more specific functions
  setEndpoints: (callback: (prev: EndpointData[]) => EndpointData[]) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) => void;
}

const useServiceStore = create<ServiceStoreState>((set, get, store) => ({
  endpoints: [],
  name: '',
  serviceId: uuid(),
  description: '',
  edges: [],
  nodes: [],
  isNewService: true,
  serviceState: ServiceState.Draft,
  isTestButtonVisible: false,
  isTestButtonEnabled: true,
  disableTestButton: () => set({ 
    isTestButtonEnabled: false,
  }),
  enableTestButton: () => set({ 
    isTestButtonEnabled: true,
    isTestButtonVisible: true,
   }),
  isSaveButtonEnabled: () => get().endpoints.length > 0,
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
  getFlatVariables: () => {
    return [...get().availableVariables.prod, ...get().availableVariables.test];
  },
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
    const newEndpoint = { id: uuid(), name: "", definedEndpoints: []};
    set(state => ({ endpoints:[ ...state.endpoints, newEndpoint] }));
  },
  resetState: () => {
    set({
      name: '',
      endpoints: [],
      serviceId: uuid(),
      description: '',
      secrets: { prod: [], test: [] },
      availableVariables: { prod: [], test: [] },
      isCommon: false,
      reactFlowInstance: null,
      selectedTab: EndpointEnv.Live,
      isNewService: true,
      edges: [],
      nodes: [],
      isTestButtonEnabled: true,
    })
  },
  loadService: async (id) => {
    get().resetState();
    let nodes = get().nodes;

    if(id) {
      const service = await axios.get<Service[]>(getServiceById(id));
      
      const structure = JSON.parse(service.data[0].structure.value);
      let endpoints = JSON.parse(service.data[0].endpoints.value);
      let edges = structure?.edges;
      nodes = structure?.nodes;

      if(!edges || edges.length === 0)
        edges = [initialEdge];

      if(!nodes || nodes.length === 0)
        nodes = initialNodes;

      if(!endpoints || !(endpoints instanceof Array))
        endpoints = [];

        nodes = nodes.map((node: any) => {
        if (node.type !== "customNode") return node;
        node.data = {
          ...node.data,
          onDelete: get().onDelete,
          setClickedNode: get().setClickedNode,
          onEdit: get().handleNodeEdit,
          update: updateFlowInputRules,
        };
        return node;
      });

      set({ 
        serviceId: id,
        name: service.data[0].name,
        isCommon : service.data[0].isCommon,
        description: service.data[0].description,
        edges,
        nodes,
        endpoints,
        isNewService: false,
        serviceState: service.data[0].state,
      });
    }

    await get().loadSecretVariables();

    if (nodes?.find(node => node.data.stepType === "auth")) {
      await get().loadTaraVariables();
    }

    const variables = nodes?.filter(node => node.data.stepType === "input")
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
      await saveFlowClick();
      set({ 
        isNewService: false
      });
    } else {
      await editServiceInfo();
    }

    navigate(ROUTES.replaceWithId(ROUTES.FLOW_ROUTE, get().serviceId));
  },
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  handleNodeEdit: (selectedNodeId: string) => {
    const reactFlowInstance = get().reactFlowInstance;
    if (!reactFlowInstance) return;
    const node = reactFlowInstance.getNode(selectedNodeId);
    get().setSelectedNode(node);
   },

  onDelete: (id, shouldAddPlaceholder) => {
    const reactFlowInstance = get().reactFlowInstance;
      if (!reactFlowInstance) return;
      const deletedNode = reactFlowInstance.getNodes().find((node) => node.id === id);
      const edgeToDeletedNode = reactFlowInstance.getEdges().find((edge) => edge.target === id);
      if (!deletedNode) return;
      let updatedNodes: Node[] = [];
      let currentEdges: Edge[] = [];
      get().setEdges((prevEdges) => (currentEdges = prevEdges));
      get().setNodes((prevNodes) => {
        let newNodes: Node[] = [];

        if (deletedNode.data.stepType !== StepType.Input) {
          // delete only targeted node
          newNodes.push(...prevNodes.filter((node) => node.id !== id));
        } else {
          // delete input node with it's rules
          const deletedRules = currentEdges.filter((edge) => edge.source === id).map((edge) => edge.target);

          newNodes.push(...prevNodes.filter((node) => node.id !== id && !deletedRules.includes(node.id)));
        }

        // cleanup leftover placeholders
        newNodes = newNodes.filter((node) => {
          if (node.type !== "placeholder") return true;

          const pointingEdge = currentEdges.find((edge) => edge.target === node.id);
          const pointingEdgeSource = newNodes.find((newNode) => newNode.id === pointingEdge?.source);
          if (!pointingEdgeSource) return false;
          return true;
        });

        updatedNodes = newNodes;
        return newNodes;
      });

      get().setEdges((prevEdges) => {
        const toRemove = prevEdges.filter((edge) => {
          if (deletedNode.data.stepType !== StepType.Input) {
            // remove edges pointing to/from removed node
            return edge.target === id || edge.source === id;
          } else {
            // remove edges not pointing to present nodes
            return !updatedNodes.map((node) => node.id).includes(edge.target);
          }
        });

        if (toRemove.length === 0) return prevEdges;
        let newEdges = [...prevEdges.filter((edge) => !toRemove.includes(edge))];
        if (
          deletedNode.data.stepType !== StepType.Input &&
          newEdges.length > 0 &&
          toRemove.length > 1 &&
          shouldAddPlaceholder
        ) {
          // if only 1 node was removed, point edge to whatever it was pointing to
          newEdges.push(
            buildEdge({
              id: `edge-${toRemove[0].source}-${toRemove[toRemove.length - 1].target}`,
              source: toRemove[0].source,
              sourceHandle: toRemove[0].sourceHandle,
              target: toRemove[toRemove.length - 1].target,
            })
          );
        }

        // cleanup possible leftover edges
        newEdges = newEdges.filter(
          (edge) =>
            updatedNodes.find((node) => node.id === edge.source) && updatedNodes.find((node) => node.id === edge.target)
        );

        return newEdges;
      });

      if (!edgeToDeletedNode || !shouldAddPlaceholder) return;
      get().setEdges((prevEdges) => {
        // check if previous node points to anything
        if (prevEdges.find((edge) => edge.source === edgeToDeletedNode.source)) {
          return prevEdges;
        }

        // Previous node points to nothing -> add placeholder with edge
        get().setNodes((prevNodes) => {
          const sourceNode = prevNodes.find((node) => node.id === edgeToDeletedNode.source);
          if (!sourceNode) return prevNodes;
          const placeholder = buildPlaceholder({
            id: deletedNode.id,
            position: {
              y: sourceNode.position.y + (sourceNode.height ?? 0),
              // Green starting node is not aligned with others, thus small offset is needed
              x: sourceNode.type === "input" ? sourceNode.position.x - 10.5 * GRID_UNIT : sourceNode.position.x,
            },
          });
          return [...prevNodes, placeholder];
        });

        prevEdges.push(
          buildEdge({
            id: `edge-${edgeToDeletedNode.source}-${deletedNode.id}`,
            source: edgeToDeletedNode.source,
            sourceHandle: `handle-${edgeToDeletedNode.source}-1`,
            target: deletedNode.id,
          })
        );
        return prevEdges;
      });
      // get().setIsTestButtonEnabled(false); ??????? to do later 
  },
  clickedNode: null,
  setClickedNode: (clickedNode) => set({ clickedNode }),

  onNodesChange: (changes: NodeChange[]) => {
    get().setNodes((prevNode) => {
      const changedNodes = applyNodeChanges(changes, prevNode);
      const newNodes = alignNodesInCaseAnyGotOverlapped(changes, changedNodes, get().edges);
      return newNodes;
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    get().setEdges((eds) => applyEdgeChanges(changes, eds))
  },
}));

export default useServiceStore;
