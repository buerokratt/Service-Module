import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { Edge, EdgeChange, Node, NodeChange, ReactFlowInstance, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { EndpointData, EndpointEnv, EndpointTab, PreDefinedEndpointEnvVariables } from "types/endpoint";
import {
  getEndpointValidation,
  getSecretVariables,
  getServiceById,
  getTaraAuthResponseVariables,
  servicesRequestsExplain,
  userStepPreferences,
} from "resources/api-constants";
import { Service, ServiceState, Step, StepType } from "types";
import { RequestVariablesTabsRawData, RequestVariablesTabsRowsData } from "types/request-variables";
import useToastStore from "./toasts.store";
import i18next from "i18next";
import { ROUTES } from "resources/routes-constants";
import { NavigateFunction } from "react-router-dom";
import { editServiceInfo, saveFlowClick } from "services/service-builder";
import { NodeDataProps, initialEdges, initialNodes } from "types/service-flow";
import { alignNodesInCaseAnyGotOverlapped, buildPlaceholder, updateFlowInputRules } from "services/flow-builder";
import { GroupOrRule } from "components/FlowElementsPopup/RuleBuilder/types";
import useTestServiceStore from "./test-services.store";
import { Chip } from "types/chip";
import { EndpointResponseVariable } from "types/endpoint/endpoint-response-variables";
import { Assign } from "types/assign";
import { EndpointType } from "types/endpoint/endpoint-type";
import api from "../services/api-dev";

interface ServiceStoreState {
  endpoints: EndpointData[];
  name: string;
  serviceId: string;
  description: string;
  slot: string;
  isCommon: boolean;
  edges: Edge[];
  nodes: Node[];
  isNewService: boolean;
  serviceState: ServiceState;
  assignElements: Assign[];
  rules: GroupOrRule[];
  isYesNoQuestion: boolean;
  stepPreferences: string[];
  endpointsResponseVariables: EndpointResponseVariable[];
  setIsYesNoQuestion: (value: boolean) => void;
  changeAssignNode: (assign: Assign[]) => void;
  changeRulesNode: (rules: GroupOrRule[]) => void;
  markAsNewService: () => void;
  unmarkAsNewService: () => void;
  setServiceId: (id: string) => void;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  vaildServiceInfo: () => boolean;
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
  setSlot: (slot: string) => void;
  setStepPreferences: (stepPreferences: string[]) => void;
  loadEndpointsResponseVariables: () => void;
  setSecrets: (newSecrets: PreDefinedEndpointEnvVariables) => void;
  addProductionVariables: (variables: string[]) => void;
  addTestVariables: (variables: string[]) => void;
  changeServiceName: (name: string) => void;
  addEndpoint: () => void;
  loadSecretVariables: () => Promise<void>;
  loadTaraVariables: () => Promise<void>;
  loadService: (id?: string, resetState?: boolean) => Promise<void>;
  loadStepPreferences: () => Promise<void>;
  getAvailableRequestValues: (endpointId: string) => PreDefinedEndpointEnvVariables;
  onNameChange: (endpointId: string, oldName: string, newName: string) => void;
  changeServiceEndpointType: (id: string, type: EndpointType) => void;
  mapEndpointsToSetps: () => Step[];
  selectedTab: EndpointEnv;
  setSelectedTab: (tab: EndpointEnv) => void;
  isLive: () => boolean;
  updateEndpointRawData: (
    rawData: RequestVariablesTabsRawData,
    endpointDataId?: string,
    parentEndpointId?: string
  ) => void;
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpointDataId?: string, parentEndpointId?: string) => void;
  resetState: () => void;
  resetAssign: () => void;
  resetRules: () => void;
  onContinueClick: () => Promise<void>;
  selectedNode: Node<NodeDataProps> | null;
  setSelectedNode: (node: Node<NodeDataProps> | null | undefined) => void;
  resetSelectedNode: () => void;
  handleNodeEdit: (selectedNodeId: string) => void;
  onDelete: (id: string) => void;
  clickedNode: any;
  setClickedNode: (clickedNode: any) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  isTestButtonEnabled: boolean;
  disableTestButton: () => void;
  enableTestButton: () => void;
  handlePopupSave: (updatedNode: Node<NodeDataProps>) => void;
  testUrl: (endpoint: EndpointData, onError: () => void, onSuccess: () => void) => Promise<void>;

  // remove the following funtions and refactor the code to use more specific functions later
  setEndpoints: (callback: (prev: EndpointData[]) => EndpointData[]) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) => void;
}

const useServiceStore = create<ServiceStoreState>((set, get, store) => ({
  endpoints: [],
  name: "",
  slot: "",
  serviceId: uuid(),
  description: "",
  edges: initialEdges,
  nodes: initialNodes,
  isNewService: true,
  serviceState: ServiceState.Draft,
  isTestButtonVisible: false,
  isTestButtonEnabled: true,
  assignElements: [],
  rules: [],
  isYesNoQuestion: false,
  stepPreferences: [],
  endpointsResponseVariables: [],
  setIsYesNoQuestion: (value: boolean) => set({ isYesNoQuestion: value }),
  changeAssignNode: (assignElements) => {
    const { nodes } = get();
    const elementsMap = new Map(
      nodes
        .filter((node) => node.data.stepType === StepType.Assign)
        .flatMap((node) => node.data?.assignElements ?? [])
        .map((element) => [element.id, element])
    );

    assignElements.forEach(
      (updated) => elementsMap.get(updated.id) && Object.assign(elementsMap.get(updated.id), updated)
    );

    const hasChangedSlot = (slot: any, elementsMap: Map<any, any>): boolean => {
      const ref = elementsMap.get(slot.id);
      if (!ref) return false;

      const valueChanged = slot.value !== ref.value;
      const slotsChanged = JSON.stringify(slot.slots) !== JSON.stringify(ref.slots);
      const changed = valueChanged || slotsChanged;

      if (changed) {
        Object.assign(slot, { ...ref, id: slot.id, key: slot.key });
      }

      if (slot.slots) {
        checkSlots(slot.slots, elementsMap);
      }

      return changed;
    };

    const checkSlots = (slots: any[], elementsMap: Map<any, any>): boolean => {
      return slots.some((slot) => hasChangedSlot(slot, elementsMap));
    };

    const processElement = (element: any, elementsMap: Map<any, any>): boolean => {
      const slotsChanged = element.slots && checkSlots(element.slots, elementsMap);

      if (element.slots?.length) {
        element.value = element.slots[0].value;
      }

      return slotsChanged;
    };

    const hasChangedElements = (node: any, elementsMap: Map<any, any>): boolean => {
      return node.data.assignElements?.some((element: any) => processElement(element, elementsMap)) ?? false;
    };

    const getAssignNodes = (nodes: any[]): any[] => {
      return nodes.filter((node) => node.data.stepType === StepType.Assign);
    };

    const updateRefs = (): boolean => {
      const assignNodes = getAssignNodes(nodes);
      return assignNodes.some((node) => hasChangedElements(node, elementsMap));
    };

    while (updateRefs()) {
      /* logic to do while refs are being updated */
    }
    set({ assignElements });
  },
  changeRulesNode: (rules) => set({ rules }),
  disableTestButton: () =>
    set({
      isTestButtonEnabled: false,
    }),
  enableTestButton: () =>
    set({
      isTestButtonEnabled: true,
      isTestButtonVisible: true,
    }),
  isSaveButtonEnabled: () => get().endpoints.length > 0,
  markAsNewService: () => set({ isNewService: true }),
  unmarkAsNewService: () => set({ isNewService: false }),
  setServiceId: (id) => set({ serviceId: id }),
  setNodes: (nodes) => {
    if (nodes instanceof Function) {
      set((state) => {
        return {
          nodes: nodes(state.nodes),
        };
      });
    } else {
      set({ nodes });
    }
  },
  setEdges: (edges) => {
    if (edges instanceof Function) {
      set((state) => {
        return {
          edges: edges(state.edges),
        };
      });
    } else {
      set({ edges });
    }
  },
  secrets: { prod: [], test: [] },
  availableVariables: { prod: [], test: [] },
  loadEndpointsResponseVariables: async () => {
    try {
      const endpointResponses = await Promise.all(
        get().endpoints.map(async (e) => {
          return Promise.all(
            e.definitions.map(async (endpoint) => {
              const response = await api.post(servicesRequestsExplain(), {
                url: endpoint.url,
                method: endpoint.methodType,
                headers: extractMapValues(endpoint.headers),
                body: extractMapValues(endpoint.body),
                params: extractMapValues(endpoint.params),
              });
              return response.data;
            })
          );
        })
      );

      const variables: EndpointResponseVariable[] = [];

      endpointResponses.forEach((response, i) => {
        const endpoint = get().endpoints[i];
        const chips: Chip[] = [];

        response.forEach((response) => {
          for (const [key, value] of Object.entries(response)) {
            chips.push({
              name: key,
              value: `${endpoint.name.replace(" ", "_")}_res.response.body.${key}`,
              data: value,
            });
          }
        });

        variables.push({
          name: endpoint.name,
          chips: chips,
        });
      });

      set({ endpointsResponseVariables: variables });
    } catch (e) {
      console.error(e);
    }
  },
  getFlatVariables: () => {
    return [...get().availableVariables.prod, ...get().availableVariables.test];
  },
  vaildServiceInfo: () => !!get().name,
  serviceNameDashed: () => get().name.trim().replace(" ", "_"),
  deleteEndpoint: (id: string) => {
    const newEndpoints = get().endpoints.filter((x) => x.endpointId !== id);
    set({ endpoints: newEndpoints });
  },
  changeServiceName: (name: string) => set({ name }),
  setDescription: (description: string) => set({ description }),
  setSlot: (slot: string) => set({ slot }),
  setStepPreferences: (stepPreferences: string[]) => set({ stepPreferences }),
  isCommon: false,
  setIsCommon: (isCommon: boolean) => set({ isCommon }),
  isCommonEndpoint: (id: string) => {
    const endpoint = get().endpoints.find((x) => x.endpointId === id);
    return endpoint?.isCommon ?? false;
  },
  setIsCommonEndpoint: (id: string, isCommon: boolean) => {
    const endpoints = get().endpoints.map((x) => {
      if (x.endpointId !== id) return x;
      return {
        ...x,
        isCommon,
      };
    });
    set({ endpoints });
  },
  setSecrets: (newSecrets: PreDefinedEndpointEnvVariables) => set({ secrets: newSecrets }),
  addProductionVariables: (variables: any) => {
    set((state) => ({
      availableVariables: {
        prod: [...variables, ...state.availableVariables.prod],
        test: state.availableVariables.test,
      },
    }));
  },
  addTestVariables: (variables: any) => {
    const prevVariables = get().availableVariables;
    set({
      availableVariables: {
        prod: prevVariables.prod,
        test: [...variables, ...prevVariables.test],
      },
    });
  },
  addEndpoint: () => {
    const newEndpoint = { endpointId: uuid(), name: "", definitions: [], isNew: true };
    set((state) => ({ endpoints: [...state.endpoints, newEndpoint] }));
  },
  resetState: () => {
    set({
      name: "",
      endpoints: [],
      serviceId: uuid(),
      description: "",
      slot: "",
      secrets: { prod: [], test: [] },
      availableVariables: { prod: [], test: [] },
      isCommon: false,
      reactFlowInstance: null,
      selectedTab: EndpointEnv.Live,
      isNewService: true,
      edges: initialEdges,
      nodes: initialNodes,
      isTestButtonEnabled: true,
      assignElements: [],
      rules: [],
      isYesNoQuestion: false,
      clickedNode: null,
      isTestButtonVisible: false,
      selectedNode: null,
      serviceState: ServiceState.Draft,
    });
    useTestServiceStore.getState().reset();
  },
  resetAssign: () => set({ assignElements: [] }),
  resetRules: () => set({ rules: [], isYesNoQuestion: false }),
  loadService: async (id, resetState) => {
    if (resetState === true) {
      get().resetState();
    }
    let nodes = get().nodes;

    if (id) {
      const serviceResponse = await api.get<Service>(getServiceById(id));

      const structure = JSON.parse(serviceResponse.data.structure?.value ?? "{}");
      let endpoints = serviceResponse.data.endpoints.map((endpoint) => {
        return {
          ...endpoint,
          definitions: JSON.parse(endpoint.definitions.value),
        };
      });
      let edges = structure?.edges;
      nodes = structure?.nodes;

      if (!edges || edges.length === 0) edges = initialEdges;

      if (!nodes || nodes.length === 0) nodes = initialNodes;

      if (!endpoints || !(endpoints instanceof Array)) endpoints = [];

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
        name: serviceResponse.data.name,
        isCommon: serviceResponse.data.isCommon,
        description: serviceResponse.data.description,
        slot: serviceResponse.data.slot,
        edges,
        nodes,
        endpoints,
        isNewService: false,
        serviceState: serviceResponse.data.state,
      });
    }

    await get().loadSecretVariables();

    if (nodes?.find((node) => node.data.stepType === "auth")) {
      await get().loadTaraVariables();
    }

    const variables = nodes
      ?.filter((node) => node.data.stepType === StepType.Input)
      .map((node) => `{{client_input_${node.data.clientInputId}}}`);

    get().addProductionVariables(variables);
  },
  loadStepPreferences: async () => {
    try {
      const response = await api.get<{ response: string[] }>(userStepPreferences());
      set({ stepPreferences: response.data.response });
    } catch (error) {
      console.error("Failed to load step preferences:", error);
    }
  },
  loadSecretVariables: async () => {
    const result = await api.get(getSecretVariables());
    const data: { prod: string[]; test: string[] } = result.data;
    data.prod = data.prod.map((v) => `{{${v}}}`);
    data.test = data.test.filter((x) => !data.prod.includes(x)).map((v) => `{{${v}}}`);

    if (!data) return;

    if (Object.keys(get().secrets).length === 0) {
      get().setSecrets(data);
    }

    get().addProductionVariables(data.prod);
    get().addTestVariables(data.test);
  },
  loadTaraVariables: async () => {
    const result = await api.post(getTaraAuthResponseVariables());
    const data: { [key: string]: any } = result.data?.response?.body ?? {};
    const taraVariables = Object.keys(data).map((key) => `{{TARA.${key}}}`);
    get().addProductionVariables(taraVariables);
  },
  getAvailableRequestValues: (endpointId: string) => {
    const variables = get()
      .endpoints.filter((endpoint) => endpoint.endpointId !== endpointId)
      .map((endpoint) => ({
        id: endpoint.endpointId,
        name: endpoint.name,
        response: endpoint.definitions.find((x) => x.isSelected)?.response ?? [],
      }))
      .flatMap(({ id, name, response }) => response?.map((x) => `{{${name === "" ? id : name}.${x.name}}}`));

    return {
      prod: [...variables, ...get().availableVariables.prod],
      test: get().availableVariables.test,
    };
  },
  onNameChange: (endpointId: string, oldName: string, newName: string) => {
    const endpoint = get().endpoints.find((x) => x.endpointId === endpointId);
    const response = endpoint?.definitions.find((x) => x.isSelected)?.response ?? [];
    const variables = response.map((x) => `{{${newName ?? x.id}.${x.name}}}`);

    const oldFilteredVariables = get().availableVariables.prod.filter(
      (v) => v.replace("{{", "").split(".")[0] !== oldName
    );

    const newEndpoints = get().endpoints.map((x) => {
      if (x.endpointId !== endpointId) return x;
      return {
        ...x,
        name: newName,
      };
    });

    set((state) => ({
      endpoints: newEndpoints,
      availableVariables: {
        prod: [...variables, ...oldFilteredVariables],
        test: state.availableVariables.test,
      },
    }));
  },
  changeServiceEndpointType: (id: string, type: EndpointType) => {
    const endpoints = get().endpoints.map((x) => {
      if (x.endpointId !== id) return x;
      return {
        ...x,
        type,
        definitions: [],
      };
    });

    set({ endpoints });
  },
  mapEndpointsToSetps: (): Step[] => {
    return get()
      .endpoints.map((x) => ({
        selected: x.definitions.find((e) => e.isSelected),
        endpoint: x,
      }))
      .filter((x) => !!x.selected)
      .map(({ selected, endpoint }, index) => ({
        id: index + 1,
        label:
          endpoint.name.trim().length > 0 ? endpoint.name : `${selected!.methodType.toUpperCase()} ${selected!.url}`,
        type: StepType.UserDefined,
        data: endpoint,
      }));
  },
  setEndpoints: (callback) => {
    set((state) => ({
      endpoints: callback(state.endpoints),
    }));
  },
  selectedTab: EndpointEnv.Live,
  setSelectedTab: (tab: EndpointEnv) => set({ selectedTab: tab }),
  isLive: () => get().selectedTab === EndpointEnv.Live,
  updateEndpointRawData: (data: RequestVariablesTabsRawData, endpointId?: string, parentEndpointId?: string) => {
    if (!endpointId) return;
    const live = get().isLive() ? "value" : "testValue";

    const endpoints = JSON.parse(JSON.stringify(get().endpoints)) as EndpointData[];
    const defEndpoint = endpoints
      .find((x) => x.endpointId === parentEndpointId)
      ?.definitions.find((x) => x.id === endpointId);

    for (const key in data) {
      if (defEndpoint?.[key as EndpointTab]) {
        defEndpoint[key as EndpointTab]!.rawData[live] = data[key as EndpointTab];
      }
    }

    set({
      endpoints,
    });
  },
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpointId?: string, parentEndpointId?: string) => {
    if (!endpointId) return;

    const live = get().isLive() ? "value" : "testValue";
    const endpoints = JSON.parse(JSON.stringify(get().endpoints)) as EndpointData[];
    const defEndpoint = endpoints
      .find((x) => x.endpointId === parentEndpointId)
      ?.definitions.find((x) => x.id === endpointId);

    if (!defEndpoint) return;

    for (const key in data) {
      const keyedDefEndpoint = defEndpoint[key as EndpointTab];
      for (const row of data[key as EndpointTab] ?? []) {
        if (
          !row.endpointVariableId &&
          row.variable &&
          !keyedDefEndpoint?.variables.map((e) => e.name).includes(row.variable)
        ) {
          keyedDefEndpoint?.variables.push({
            id: uuid(),
            name: row.variable,
            type: "custom",
            required: false,
            [live]: row.value,
          });
        }
      }

      for (const variable of keyedDefEndpoint?.variables ?? []) {
        const updatedVariable = data[key as EndpointTab]!.find((updated) => updated.endpointVariableId === variable.id);
        variable[live] = updatedVariable?.value;
        variable.name = updatedVariable?.variable ?? variable.name;
      }
    }

    set({
      endpoints,
    });
  },
  reactFlowInstance: null,
  setReactFlowInstance: (reactFlowInstance) => set({ reactFlowInstance }),
  onContinueClick: async () => {
    const vaildServiceInfo = get().vaildServiceInfo();

    if (!vaildServiceInfo) {
      useToastStore.getState().error({
        title: i18next.t("newService.toast.missingFields"),
        message: i18next.t("newService.toast.serviceMissingFields"),
      });
      return;
    }

    if (get().isNewService) {
      await saveFlowClick();
      set({
        isNewService: false,
      });
    } else {
      await editServiceInfo();
    }
  },
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  handleNodeEdit: (selectedNodeId: string) => {
    const reactFlowInstance = get().reactFlowInstance;
    if (!reactFlowInstance) return;
    const node = reactFlowInstance.getNode(selectedNodeId);
    get().setSelectedNode(node);
  },

  onDelete: (id) => {
    const state = get();
    const reactFlowInstance = getReactFlowInstance(state);

    // Get connected nodes and edges
    const { edgesFromNode, edgesFromNextNode } = getConnectedNodes(reactFlowInstance, id);

    // Determine children nodes
    let children = determineChildrenNodes(reactFlowInstance, edgesFromNode, edgesFromNextNode);

    // Start with removing the deleted node
    let nodes = state.nodes.filter((x) => x.id !== id);

    // Handle placeholder nodes if they exist
    ({ children, nodes } = handlePlaceholderNodes(children, nodes));

    // Handle child node (either existing or new placeholder)
    const { child, nodes: updatedNodes } = handleChildNode(reactFlowInstance, children, nodes, id, state.nodes.length);
    nodes = updatedNodes;

    // Update edges (remove and redirect)
    const edges = updateEdges(state.edges, id, child);

    // Clean up orphaned nodes
    nodes = cleanupOrphanedNodes(nodes, edges);

    // Clean up intermediate nodes if needed
    nodes = cleanupIntermediateNodes(nodes, edgesFromNode, edgesFromNextNode, state.nodes.length);

    // Update edges and nodes
    set({ edges, nodes });
  },
  clickedNode: null,
  setClickedNode: (clickedNode) => set({ clickedNode }),

  onNodesChange: (changes: NodeChange[]) => {
    get().setNodes((prevNode) => {
      const changedNodes = applyNodeChanges(changes, prevNode);
      const newNodes = alignNodesInCaseAnyGotOverlapped(changes, changedNodes, get().edges);
      return newNodes;
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    get().setEdges((eds) => applyEdgeChanges(changes, eds));
  },
  resetSelectedNode: () => set({ selectedNode: null }),
  handlePopupSave: (updatedNode) => {
    const selectedNode = get().selectedNode;
    get().resetSelectedNode();
    if (selectedNode?.data.stepType === StepType.FinishingStepEnd) return;

    get().setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.id !== selectedNode!.id) return prevNode;
        if (
          prevNode.data.message != updatedNode.data.message ||
          prevNode.data.link != updatedNode.data.link ||
          prevNode.data.linkText != updatedNode.data.linkText ||
          prevNode.data.fileName != updatedNode.data.fileName ||
          prevNode.data.fileContent != updatedNode.data.fileContent ||
          prevNode.data.signOption != updatedNode.data.signOption ||
          prevNode.data.multiChoiceQuestion != updatedNode.data.multiChoiceQuestion
        ) {
          useServiceStore.getState().disableTestButton();
        }
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            message: updatedNode.data.message,
            link: updatedNode.data.link,
            linkText: updatedNode.data.linkText,
            fileName: updatedNode.data.fileName,
            fileContent: updatedNode.data.fileContent,
            signOption: updatedNode.data.signOption,
            multiChoiceQuestion: updatedNode.data.multiChoiceQuestion,
          },
        };
      })
    );
  },
  testUrl: async (endpoint, onError, onSuccess) => {
    try {
      new URL(endpoint.definitions[0].url ?? "");
      if (endpoint.definitions[0].methodType === "GET") {
        await api.post(getEndpointValidation(), {
          url: endpoint.definitions[0].url ?? "",
          type: "GET",
        });
      } else {
        await api.post(getEndpointValidation(), {
          url: endpoint.definitions[0].url ?? "",
          type: "POST",
        });
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      onError();
    }
  },
}));

function extractMapValues(element: any) {
  if (element.rawData && element.rawData.length > 0) {
    return element.rawData.value;
  }

  let result: any = {};
  for (const entry of element.variables) {
    result = { ...result, [entry.name]: entry.value };
  }
  return result;
}

const getReactFlowInstance = (state: any) => {
  const instance = state.reactFlowInstance;
  if (!instance) throw new Error("React Flow instance not available");
  return instance;
};

const getConnectedNodes = (reactFlowInstance: any, nodeId: string) => {
  const edgesFromNode = reactFlowInstance
    .getEdges()
    .filter((edge: any) => edge.source === nodeId)
    .map((edge: any) => edge.target);

  const edgesFromNextNode = reactFlowInstance
    .getEdges()
    .filter((edge: any) => edge.source === edgesFromNode[0])
    .map((edge: any) => edge.target);

  return { edgesFromNode, edgesFromNextNode };
};

const determineChildrenNodes = (reactFlowInstance: any, edgesFromNode: string[], edgesFromNextNode: string[]) => {
  if (edgesFromNextNode.length > 0) {
    return reactFlowInstance.getNodes().filter((node: any) => edgesFromNextNode.includes(node.id));
  }
  return reactFlowInstance.getNodes().filter((node: any) => edgesFromNode.includes(node.id));
};

const handlePlaceholderNodes = (children: any[], nodes: any[]) => {
  if (children.length === 2) {
    if (children[0].type === "placeholder") {
      nodes = nodes.filter((x) => x.id !== children[0].id);
      children.shift();
    } else if (children[1].type === "placeholder") {
      nodes = nodes.filter((x) => x.id !== children[1].id);
      children.pop();
    } else {
      children = [];
    }
  }
  return { children, nodes };
};

const handleChildNode = (
  reactFlowInstance: any,
  children: any[],
  nodes: any[],
  deletedNodeId: string,
  stateNodesLength: number
) => {
  let child: any = undefined;

  if (children.length === 1) {
    child = children[0];
  } else if (children.length === 0) {
    const deletedNode = reactFlowInstance.getNodes().find((node: any) => node.id === deletedNodeId);
    const deletedNodePosition = deletedNode?.position;
    const deletedNodeStepType = deletedNode?.data.stepType;

    if (
      deletedNodeStepType !== StepType.FinishingStepEnd ||
      (deletedNodeStepType !== StepType.FinishingStepRedirect && stateNodesLength <= 4)
    ) {
      const placeholder = buildPlaceholder({ id: deletedNodeId, position: deletedNodePosition });
      nodes.push(placeholder);
      child = placeholder;
    }
  }

  return { child, nodes };
};

const updateEdges = (edges: any[], deletedNodeId: string, child: any) => {
  return edges
    .filter((x) => x.source !== deletedNodeId)
    .map((x) => (x.target === deletedNodeId && child ? { ...x, target: child.id } : x));
};

const cleanupOrphanedNodes = (nodes: any[], edges: any[]) => {
  return nodes.filter((x) => edges.find((y) => y.target === x.id || y.source === x.id));
};

const cleanupIntermediateNodes = (
  nodes: any[],
  edgesFromNode: string[],
  edgesFromNextNode: string[],
  stateNodesLength: number
) => {
  let updatedNodes = [...nodes];

  if (edgesFromNextNode.length > 0) {
    updatedNodes = updatedNodes.filter((x) => x.id !== edgesFromNode[0]);
    if (edgesFromNextNode.length === 2) {
      updatedNodes = updatedNodes.filter((x) => x.id !== edgesFromNode[1]);
    }
  }

  if (edgesFromNode.length > 0 && stateNodesLength > 4) {
    updatedNodes = updatedNodes.filter((x) => x.id !== edgesFromNode[0]);
    if (edgesFromNode.length === 2) {
      updatedNodes = updatedNodes.filter((x) => x.id !== edgesFromNode[1]);
    }
  }

  return updatedNodes;
};

export default useServiceStore;
