import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { Edge, EdgeChange, Node, NodeChange, ReactFlowInstance, applyEdgeChanges, applyNodeChanges, getIncomers, getOutgoers } from "@xyflow/react";
import { EndpointData, EndpointEnv, EndpointTab, PreDefinedEndpointEnvVariables } from "types/endpoint";
import {
  getCommonEndpoints,
  getEndpointValidation,
  getSecretVariables,
  getServiceById,
  getTaraAuthResponseVariables,
  servicesRequestsExplain,
  userStepPreferences,
} from "resources/api-constants";
import { EndpointDefinitionJson, Service, ServiceState, Step, StepType } from "types";
import { RequestVariablesTabsRawData, RequestVariablesTabsRowsData } from "types/request-variables";
import useToastStore from "./toasts.store";
import i18next from "i18next";
import { saveFlowClick } from "services/service-builder";
import { NodeDataProps, initialEdges, initialNodes } from "types/service-flow";
import { alignNodesInCaseAnyGotOverlapped, updateFlowInputRules } from "services/flow-builder";
import { GroupOrRule } from "components/FlowElementsPopup/RuleBuilder/types";
import useTestServiceStore from "./test-services.store";
import { Chip } from "types/chip";
import { EndpointResponseVariable } from "types/endpoint/endpoint-response-variables";
import { Assign } from "types/assign";
import { EndpointType } from "types/endpoint/endpoint-type";
import api from "../services/api-dev";
import { AxiosResponse } from "axios";

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
  addEndpoint: (endpoint?: EndpointData) => void;
  editEndpoint: (endpoint?: EndpointData) => void;
  loadSecretVariables: () => Promise<void>;
  loadTaraVariables: () => Promise<void>;
  loadService: (id?: string, resetState?: boolean) => Promise<AxiosResponse<Service, any> | undefined>;
  loadCommonEndpoints: () => Promise<void>;
  loadStepPreferences: () => Promise<void>;
  getAvailableRequestValues: (endpoint: EndpointData) => PreDefinedEndpointEnvVariables;
  onNameChange: (endpointId: string, oldName: string, newName: string) => void;
  changeServiceEndpointType: (endpoint: EndpointData, type: EndpointType) => void;
  mapEndpointsToSteps: () => Step[];
  selectedTab: EndpointEnv;
  setSelectedTab: (tab: EndpointEnv) => void;
  isLive: () => boolean;
  updateEndpointRawData: (rawData: RequestVariablesTabsRawData, endpoint?: EndpointData) => void;
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpoint?: EndpointData) => void;
  resetState: () => void;
  resetAssign: () => void;
  resetRules: () => void;
  onServiceSave: (status: "draft" | "ready") => Promise<void>;
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
  onNodeAdded: (node: Node) => void;
  isTestButtonEnabled: boolean;
  disableTestButton: () => void;
  enableTestButton: () => void;
  handlePopupSave: (updatedNode: Node<NodeDataProps>) => void;
  testUrl: (endpoint: EndpointData, onError: () => void, onSuccess: () => void) => Promise<void>;

  // remove the following funtions and refactor the code to use more specific functions later
  setEndpoints: (callback: (prev: EndpointData[]) => EndpointData[]) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (reactFlowInstance: ReactFlowInstance | null) => void;
  hasUnsavedChanges: boolean;
  nextLocation: string | null;
  setHasUnsavedChanges: (value: boolean) => void;
  proceedNavigation: () => string | null;
  cancelNavigation: () => void;
  handleNavigationAttempt: (to: string) => boolean;
  handleProgrammaticNavigation: (to: string) => boolean;
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
      const instance = get().reactFlowInstance;
      if (!instance) return;
      const endpointNodes = instance
        .getNodes()
        .filter((node) => node.data.stepType === StepType.UserDefined) as Node<NodeDataProps>[];
      if (endpointNodes.length === 0) {
        set({ endpointsResponseVariables: [] });
        return;
      }

      const endpointsFromNodes = endpointNodes.map((node) => node.data.endpoint);
      const requests = endpointsFromNodes.flatMap((e) =>
        e?.definitions.map((endpoint) => ({
          url: endpoint.url,
          method: endpoint.methodType,
          headers: extractMapValues(endpoint.headers),
          body: extractMapValues(endpoint.body),
          params: extractMapValues(endpoint.params),
        }))
      );

      const response = await api.post(servicesRequestsExplain(), {
        requests: requests,
      });

      const variables: EndpointResponseVariable[] = [];

      response.data.response.forEach((res: any, i: number) => {
        const endpoint = endpointsFromNodes[i];
        const chips: Chip[] = [];

        for (const [key, value] of Object.entries(res)) {
          chips.push({
            name: key,
            value: `${endpoint?.name.replace(" ", "_")}_res.response.body.${key}`,
            data: value,
          });
        }

        const variable: EndpointResponseVariable = {
          name: endpoint?.name ?? "",
          chips: chips,
        };

        variables.push(variable);
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
  serviceNameDashed: () => get().name.replaceAll(" ", "_"),
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
  addEndpoint: (endpoint?: EndpointData) => {
    if (endpoint) {
      set((state) => ({ endpoints: [...state.endpoints, endpoint] }));
      return;
    }
    const newEndpoint = { endpointId: uuid(), name: "", definitions: [], isNew: true };
    set((state) => ({ endpoints: [...state.endpoints, newEndpoint] }));
  },
  editEndpoint: (updatedEndpoint?: EndpointData) => {
    if (!updatedEndpoint) return;
    set((state) => ({
      endpoints: state.endpoints.map((endpoint) =>
        endpoint.endpointId === updatedEndpoint.endpointId ? { ...updatedEndpoint, isNew: false } : endpoint
      ),
    }));
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
    let serviceResponse: AxiosResponse<Service, any> | undefined;

    if (id) {
      serviceResponse = await api.get<Service>(getServiceById(id));

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
        if (node.type !== "custom") return node;
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
    return serviceResponse;
  },
  loadCommonEndpoints: async () => {
    const response = await api.get(getCommonEndpoints());
    const endpointsResponse: Array<
      Pick<EndpointData, "endpointId" | "name" | "type" | "fileName" | "isCommon"> & {
        definitions: EndpointDefinitionJson;
      }
    > = response.data.response;
    let endpoints = endpointsResponse.map((endpoint) => {
      return {
        ...endpoint,
        definitions: JSON.parse(endpoint.definitions.value),
      };
    });

    set({
      endpoints,
    });
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
  getAvailableRequestValues: (endpoint: EndpointData) => {
    const selectedDefinition = endpoint.definitions.find((x) => x.isSelected);
    const responseVariables = selectedDefinition?.response ?? [];

    const variables = responseVariables.map(
      (x) => `{{${endpoint.name === "" ? endpoint.endpointId : endpoint.name}.${x.name}}}`
    );

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
  changeServiceEndpointType: (endpoint: EndpointData, type: EndpointType) => {
    endpoint.type = type;
  },
  mapEndpointsToSteps: (): Step[] => {
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
  setEndpoints: () => {},
  selectedTab: EndpointEnv.Live,
  setSelectedTab: (tab: EndpointEnv) => set({ selectedTab: tab }),
  isLive: () => get().selectedTab === EndpointEnv.Live,
  updateEndpointRawData: (data: RequestVariablesTabsRawData, endpoint?: EndpointData) => {
    if (!endpoint) return;
    const live = "value";

    const defEndpoint = endpoint.definitions[0];

    for (const key in data) {
      if (defEndpoint?.[key as EndpointTab]) {
        defEndpoint[key as EndpointTab]!.rawData[live] = data[key as EndpointTab];
      }
    }

    endpoint.definitions[0] = defEndpoint;
    return endpoint;
  },
  updateEndpointData: (data: RequestVariablesTabsRowsData, endpoint?: EndpointData) => {
    if (!endpoint) return;

    const defEndpoint = endpoint.definitions[0];  

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
            value: row.value,
          });
        }
      }

      for (const variable of keyedDefEndpoint?.variables ?? []) {
        const updatedVariable = data[key as EndpointTab]!.find((updated) => updated.endpointVariableId === variable.id);
        variable.name = updatedVariable?.variable ?? variable.name;
        variable.value = updatedVariable?.value ?? variable.value;
      }
    }

    endpoint.definitions[0] = defEndpoint;
    return endpoint;
  },
  reactFlowInstance: null,
  setReactFlowInstance: (reactFlowInstance) => set({ reactFlowInstance }),
  onServiceSave: async (status: "draft" | "ready" = "ready") => {
    await saveFlowClick(status);
  },
  onContinueClick: async () => {
    const vaildServiceInfo = get().vaildServiceInfo();

    if (!vaildServiceInfo) {
      useToastStore.getState().error({
        title: i18next.t("newService.toast.missingFields"),
        message: i18next.t("newService.toast.serviceMissingFields"),
      });
      return;
    }

    const { isNewService, onServiceSave } = get();

    await onServiceSave(ServiceState.Ready);

    if (isNewService) {
      set({ isNewService: false });
    }
  },
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  handleNodeEdit: (selectedNodeId: string) => {
    const reactFlowInstance = get().reactFlowInstance;
    if (!reactFlowInstance) return;
    const node = reactFlowInstance.getNode(selectedNodeId);
    get().setSelectedNode(node as Node<NodeDataProps>);
  },
  onDelete: (id) => {
    getReactFlowInstance(get()).deleteElements({ nodes: [get().nodes.find((n) => n.id === id)], edges: [] });
  },
  clickedNode: null,
  setClickedNode: (clickedNode) => set({ clickedNode }),
  onNodesChange: (changes: NodeChange[]) => {
    get().setNodes((prevNode) => {
      const changedNodes = applyNodeChanges(changes, prevNode);
      const newNodes = alignNodesInCaseAnyGotOverlapped(changes, changedNodes, get().edges);
      changes.forEach((change) => {
        if (change.type === "add") {
          get().onNodeAdded(change.item);
        }
      });
      return newNodes;
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    get().setEdges((eds) => applyEdgeChanges(changes, eds));
  },

  onNodeAdded: (node: Node) => {
    const cleanupGhostNodes = () => {
      const instance = get().reactFlowInstance;
      if (!instance) return;

      const nodes = instance.getNodes() ?? [];
      const edges = instance.getEdges() ?? [];

      nodes
        .filter((n) => n.type === "ghost")
        .forEach((ghostNode) => {
          const incomers = getIncomers(ghostNode, nodes, edges);
          const outgoers = getOutgoers(ghostNode, nodes, edges);

          if (incomers.length === 0 && outgoers.length === 0) {
            instance.deleteElements({ nodes: [ghostNode] });
          }
        });
    };

    requestAnimationFrame(cleanupGhostNodes);
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
            endpoint: updatedNode.data.endpoint,
            label: updatedNode.data.label,
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
  hasUnsavedChanges: false,
  nextLocation: null,
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
  handleNavigationAttempt: (to) => {
    if (get().hasUnsavedChanges) {
      set({ nextLocation: to });
      return false;
    }
    return true;
  },
  handleProgrammaticNavigation: (to) => {
    if (get().hasUnsavedChanges) {
      set({ nextLocation: to });
      return false;
    }
    return true;
  },
  proceedNavigation: () => {
    set({ hasUnsavedChanges: false });
    const nextLocation = get().nextLocation;
    set({ nextLocation: null });
    return nextLocation;
  },
  cancelNavigation: () => {
    set({ nextLocation: null });
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

export default useServiceStore;
