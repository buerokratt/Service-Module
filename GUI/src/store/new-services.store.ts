import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  getIncomers,
  getOutgoers,
  Node,
  NodeChange,
  ReactFlowInstance,
} from '@xyflow/react';
import { AxiosResponse } from 'axios';
import { GroupOrRule } from 'components/FlowElementsPopup/RuleBuilder/types';
import i18next, { t } from 'i18next';
import {
  getCommonEndpoints,
  getEndpointValidation,
  getSecretVariables,
  getServiceById,
  getTaraAuthResponseVariables,
  servicesRequestsExplain,
  userStepPreferences,
} from 'resources/api-constants';
import { alignNodesInCaseAnyGotOverlapped, updateFlowInputRules } from 'services/flow-builder';
import { saveFlowClick } from 'services/service-builder';
import { EndpointDefinitionJson, Service, ServiceState, Step, StepType } from 'types';
import { Assign } from 'types/assign';
import { Chip } from 'types/chip';
import { EndpointData, EndpointDefinition, EndpointEnv, EndpointTab, PreDefinedEndpointEnvVariables } from 'types/endpoint';
import { EndpointResponseVariable } from 'types/endpoint/endpoint-response-variables';
import { EndpointType } from 'types/endpoint/endpoint-type';
import { RequestVariablesTabsRawData, RequestVariablesTabsRowsData } from 'types/request-variables';
import { initialEdges, initialNodes, NodeDataProps } from 'types/service-flow';
import { generateJsonRequest } from 'utils/json-request-utils';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';

import useTestServiceStore from './test-services.store';
import useToastStore from './toasts.store';
import api from '../services/api-dev';

export interface ServiceStoreState {
  endpoints: EndpointData[];
  name: string;
  serviceId: string;
  description: string;
  slot: string;
  examples: string[];
  entities: string[];
  isCommon: boolean;
  edges: Edge[];
  // In the future, this needs to use a common interface with NodeDataProps and not Node
  nodes: Node[];
  flowSelectedNodes: Node[];
  isNewService: boolean;
  serviceState?: ServiceState;
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
  // In the future, this needs to use a common interface with NodeDataProps and not Node
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setFlowSelectedNodes: (nodes: Node[]) => void;
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
  setExamples: (examples: string[]) => void;
  setEntities: (entities: string[]) => void;
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
  onServiceSave: (status: 'draft' | 'ready', showError?: boolean) => Promise<void>;
  onContinueClick: () => Promise<void>;
  selectedNode: Node<NodeDataProps> | null;
  setSelectedNode: (node: Node<NodeDataProps> | null | undefined) => void;
  resetSelectedNode: () => void;
  handleNodeEdit: (selectedNodeId: string) => void;
  onDelete: (id: string) => void;
  clickedNode: string | null;
  setClickedNode: (clickedNode: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onNodeAdded: (node: Node) => void;
  isTestButtonEnabled: boolean;
  disableTestButton: () => void;
  enableTestButton: () => void;
  handlePopupSave: (updatedNode: Node<NodeDataProps>) => void;
  testUrl: (endpoint: EndpointData, onError: () => void, onSuccess: () => void) => Promise<void>;
  isJsonRequestVisible: boolean;
  jsonRequestContent: any;
  setJsonRequestVisible: (visible: boolean) => void;
  setJsonRequestContent: (content: any) => void;
  triggerJsonRequest: (endpoint: EndpointData) => void;
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
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const deepCloneValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(deepCloneValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, val]) => {
      acc[key] = deepCloneValue(val);
      return acc;
    }, {});
  }

  return value;
};

const cloneAssignElement = (element: Assign): Assign => {
  const clonedSlots = element.slots ? (element.slots as Assign[]).map(cloneAssignElement) : undefined;

  return {
    ...element,
    slots: clonedSlots as Assign['slots'],
    data: deepCloneValue(element.data),
  };
};

const useServiceStore = create<ServiceStoreState>((set, get) => ({
  endpoints: [],
  name: '',
  slot: '',
  examples: [],
  entities: [],
  serviceId: uuid(),
  description: '',
  edges: initialEdges,
  nodes: initialNodes,
  flowSelectedNodes: [],
  isNewService: true,
  serviceState: undefined,
  isTestButtonVisible: false,
  isTestButtonEnabled: true,
  assignElements: [],
  rules: [],
  isYesNoQuestion: false,
  stepPreferences: [],
  endpointsResponseVariables: [],
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,
  setIsYesNoQuestion: (value: boolean) => set({ isYesNoQuestion: value }),
  changeAssignNode: (assignElements) => {
    const clonedElements = assignElements.map(cloneAssignElement);
    set({ assignElements: clonedElements });
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
  setFlowSelectedNodes: (nodes: Node[]) => set({ flowSelectedNodes: nodes }),
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
          body: getEndpointBody(endpoint),
          params: extractMapValues(endpoint.params),
        })),
      );

      const response = await api.post<{ response: Record<string, unknown>[] }>(servicesRequestsExplain(), {
        requests: requests,
      });

      const variables: EndpointResponseVariable[] = [];

      response.data.response.forEach((res, i) => {
        const endpoint = endpointsFromNodes[i];
        const chips: Chip[] = [];

        for (const [key, value] of Object.entries(res)) {
          chips.push({
            name: key,
            value: `${endpoint?.name.replace(' ', '_')}_res.response.body.${key}`,
            data: value,
          });
        }

        chips.push({
          name: 'Status Code',
          value: `${endpoint?.name.replaceAll(' ', '_')}_res.response.statusCodeValue`,
          data: `${endpoint?.name.replaceAll(' ', '_')}_res.response.statusCodeValue`,
        });

        const variable: EndpointResponseVariable = {
          name: endpoint?.name ?? '',
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
  serviceNameDashed: () => get().name.replaceAll(' ', '_'),
  deleteEndpoint: (id: string) => {
    const newEndpoints = get().endpoints.filter((x) => x.endpointId !== id);
    set({ endpoints: newEndpoints });
  },
  changeServiceName: (name: string) => set({ name }),
  setDescription: (description: string) => set({ description }),
  setSlot: (slot: string) => set({ slot }),
  setExamples: (examples: string[]) => set({ examples: examples }),
  setEntities: (entities: string[]) => set({ entities: entities }),
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
    const newEndpoint = { endpointId: uuid(), name: '', definitions: [], isNew: true };
    set((state) => ({ endpoints: [...state.endpoints, newEndpoint] }));
  },
  editEndpoint: (updatedEndpoint?: EndpointData) => {
    if (!updatedEndpoint) return;
    set((state) => ({
      endpoints: state.endpoints.map((endpoint) =>
        endpoint.endpointId === updatedEndpoint.endpointId ? { ...updatedEndpoint, isNew: false } : endpoint,
      ),
    }));
  },
  resetState: () => {
    set({
      name: '',
      endpoints: [],
      serviceId: uuid(),
      description: '',
      slot: '',
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
      serviceState: undefined,
      history: [{ nodes: initialNodes, edges: initialEdges }],
      historyIndex: 0,
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

      const structure = JSON.parse(serviceResponse.data.structure?.value ?? '{}');
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
        if (node.type !== 'custom') return node;
        node.data = {
          ...node.data,
          onDelete: get().onDelete,
          setClickedNode: get().setClickedNode,
          onEdit: get().handleNodeEdit,
          update: updateFlowInputRules,
        };
        return node;
      });

      const initialHistoryState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };

      set({
        serviceId: id,
        name: serviceResponse.data.name,
        isCommon: serviceResponse.data.isCommon,
        description: serviceResponse.data.description,
        slot: serviceResponse.data.slot,
        examples: serviceResponse.data.examples,
        entities: serviceResponse.data.entities,
        edges,
        nodes,
        endpoints,
        isNewService: false,
        serviceState: serviceResponse.data.state,
        history: [initialHistoryState],
        historyIndex: 0,
      });
    } else {
      set({
        history: [{ nodes: initialNodes, edges: initialEdges }],
        historyIndex: 0,
      });
    }

    await get().loadSecretVariables();

    if (nodes?.find((node) => node.data.stepType === 'auth')) {
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
      Pick<EndpointData, 'endpointId' | 'name' | 'type' | 'fileName' | 'isCommon'> & {
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
      const response = await api.get<{ response: { steps: string[]; endpoints: string[] } }>(userStepPreferences());
      set({
        stepPreferences: response.data.response.steps ?? [],
      });
    } catch (error) {
      console.error('Failed to load step preferences:', error);
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
      (x) => `{{${endpoint.name === '' ? endpoint.endpointId : endpoint.name}.${x.name}}}`,
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
      (v) => v.replace('{{', '').split('.')[0] !== oldName,
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
    const live = 'value';

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
            type: 'custom',
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
  onServiceSave: async (status: 'draft' | 'ready' = 'ready', showError = true) => {
    await saveFlowClick(status, showError);
  },
  onContinueClick: async () => {
    const vaildServiceInfo = get().vaildServiceInfo();

    if (!vaildServiceInfo) {
      useToastStore.getState().error({
        title: i18next.t('newService.toast.missingFields'),
        message: i18next.t('newService.toast.serviceMissingFields'),
      });
      return Promise.reject(new Error(i18next.t('newService.toast.missingFields') ?? 'Error'));
    }

    const { isNewService, onServiceSave } = get();

    try {
      await onServiceSave(ServiceState.Ready);
    } catch (e: any) {
      return Promise.reject(new Error(i18next.t('toast.cannot-save-flow') ?? (e?.message as string) ?? 'Error'));
    }

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
        if (change.type === 'add') {
          get().onNodeAdded(change.item);
        }
      });
      return newNodes;
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    get().setEdges((eds) => applyEdgeChanges(changes, eds));
  },
  onNodeAdded: (_: Node) => {
    const cleanupGhostNodes = async () => {
      const instance = get().reactFlowInstance;
      if (!instance) return;

      const nodes = instance.getNodes() ?? [];
      const edges = instance.getEdges() ?? [];

      const ghostNodes = nodes.filter((n) => n.type === 'ghost');
      for (const ghostNode of ghostNodes) {
        const incomers = getIncomers(ghostNode, nodes, edges);
        const outgoers = getOutgoers(ghostNode, nodes, edges);

        if (incomers.length === 0 && outgoers.length === 0) {
          await instance.deleteElements({ nodes: [ghostNode] });
        }
      }
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
          prevNode.data.multiChoiceQuestion != updatedNode.data.multiChoiceQuestion ||
          prevNode.data.dynamicChoices != updatedNode.data.dynamicChoices
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
            dynamicChoices: updatedNode.data.dynamicChoices,
            endpoint: updatedNode.data.endpoint,
            label: updatedNode.data.label,
            testingPassed: updatedNode.data.testingPassed,
            assignElements: updatedNode.data.assignElements ?? prevNode.data.assignElements,
            rules: updatedNode.data.rules ?? prevNode.data.rules,
          },
        };
      }),
    );

    get().saveToHistory();
  },
  testUrl: async (endpoint, onError, onSuccess) => {
    try {
      new URL(endpoint.definitions[0].url ?? '');
      if (endpoint.definitions[0].methodType === 'GET') {
        await api.post(getEndpointValidation(), {
          url: endpoint.definitions[0].url ?? '',
          type: 'GET',
        });
      } else {
        await api.post(getEndpointValidation(), {
          url: endpoint.definitions[0].url ?? '',
          type: 'POST',
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
  isJsonRequestVisible: false,
  jsonRequestContent: null,
  setJsonRequestVisible: (visible: boolean) => set({ isJsonRequestVisible: visible }),
  setJsonRequestContent: (content: any) => set({ jsonRequestContent: content }),
  triggerJsonRequest: (endpoint: EndpointData) => {
    generateJsonRequest(endpoint.definitions[0])
      .then((content) => {
        set({ jsonRequestContent: content, isJsonRequestVisible: true });
        useToastStore.getState().success({
          title: t('newService.endpoint.success'),
        });
      })
      .catch((error) => {
        useToastStore.getState().error({
          title: error.message ?? t('newService.endpoint.error'),
        });
      });
  },
  saveToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();

    const currentState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    const lastState = history[historyIndex];

    const statesAreEqual =
      lastState &&
      JSON.stringify(lastState.nodes) === JSON.stringify(currentState.nodes) &&
      JSON.stringify(lastState.edges) === JSON.stringify(currentState.edges);

    if (statesAreEqual) {
      return;
    }

    history.push(currentState);

    set({
      history,
      historyIndex: historyIndex + 1,
      hasUnsavedChanges: true,
    });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      let nodes = JSON.parse(JSON.stringify(previousState.nodes));

      nodes = nodes.map((node: any) => {
        if (node.type !== 'custom') return node;
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
        nodes: nodes,
        edges: JSON.parse(JSON.stringify(previousState.edges)),
        historyIndex: historyIndex - 1,
        hasUnsavedChanges: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      let nodes = JSON.parse(JSON.stringify(nextState.nodes));

      nodes = nodes.map((node: any) => {
        if (node.type !== 'custom') return node;
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
        nodes: nodes,
        edges: JSON.parse(JSON.stringify(nextState.edges)),
        historyIndex: historyIndex + 1,
        hasUnsavedChanges: true,
      });
    }
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));

export function getEndpointBody(endpoint: EndpointDefinition): any {
  const isRawBodySelected = endpoint?.body?.isRawSelected ?? false;
  const rawBody = endpoint?.body?.rawData ?? {};
  let body: any = extractMapValues(endpoint.body);

  if (isRawBodySelected) {
    try {
      const rawJson = JSON.parse(rawBody?.value ?? '');
      body = rawJson;
    } catch (e: any) {
      body = extractMapValues(endpoint.body);
      console.log(`Unable to save JSON to Yaml. ${e.message}`);
    }
  }
  return body;
}

export function extractMapValues(element: any) {
  if (!element) return {};

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
  if (!instance) throw new Error('React Flow instance not available');
  return instance;
};

export default useServiceStore;
