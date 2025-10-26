import { Edge, Node } from '@xyflow/react';
import { AxiosError } from 'axios';
import { Group, Rule } from 'components/FlowElementsPopup/RuleBuilder/types';
import { format } from 'date-fns';
import i18next, { t } from 'i18next';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { createEndpoint, createNewService, editService, updateEndpoint } from 'resources/api-constants';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { StepType } from 'types';
import { Assign } from 'types/assign';
import { EndpointData, EndpointVariableData } from 'types/endpoint';
import { NodeDataProps } from 'types/service-flow';
import { getLastDigits, removeTrailingUnderscores, stringToArray, toSnakeCase } from 'utils/string-util';

import api from '../services/api-dev';

export async function saveEndpoints(endpoints: EndpointData[], onSuccess?: () => void, onError?: (e: any) => void) {
  const tasks: Promise<any>[] = [];
  const serviceId = useServiceStore.getState().serviceId;

  for (const endpoint of endpoints) {
    const selectedEndpointType = endpoint.definitions.find((e) => e.isSelected);
    if (!selectedEndpointType) continue;
    endpoint.serviceId = serviceId;
    endpoint.isCommon = endpoint.isCommon ?? false;
  }

  endpoints.forEach((endpoint) => {
    if (endpoint.isNew) {
      tasks.push(createEndpointAndUpdateState(endpoint));
    } else {
      tasks.push(
        api.post(updateEndpoint(endpoint.endpointId), {
          ...endpoint,
          // Stringify needed for Resql to save nested data in a proper parsable format
          definitions: JSON.stringify(endpoint.definitions),
        }),
      );
    }
  });

  await Promise.all(tasks).then(onSuccess).catch(onError);
}

async function createEndpointAndUpdateState(endpoint: EndpointData): Promise<any> {
  const response = await api.post(createEndpoint(), {
    ...endpoint,
    // Stringify needed for Resql to save nested data in a proper parsable format
    definitions: JSON.stringify(endpoint.definitions),
  });
  endpoint.isNew = false;
  return response;
}

interface SaveFlowConfig {
  name: string;
  edges: Edge[];
  nodes: Node[];
  onSuccess: (e: any) => void;
  onError: (e: any) => void;
  description: string;
  slot: string;
  isCommon: boolean;
  serviceId: string;
  isNewService: boolean;
  status: 'draft' | 'ready';
  showError?: boolean;
}

const hasInvalidRules = (elements: any[]): boolean => {
  return elements.some((e) => {
    if ('children' in e) {
      const group = e as Group;
      if (group.children.length === 0) return true;
      return hasInvalidRules(group.children);
    } else {
      const rule = e as Rule;
      return rule.value === '' || rule.field === '' || rule.operator === '';
    }
  });
};

const hasInvalidElements = (elements: any[]): boolean => {
  return elements.some((e) => {
    const element = e as Assign;
    return element.key === '' || element.value === '';
  });
};

const buildConditionString = (group: any): string => {
  if ('children' in group) {
    const subgroup = group as Group;
    if (subgroup.children.length === 0) {
      return '';
    }

    const conditions = subgroup.children.map((child) => {
      if ('children' in child) {
        return `(${buildConditionString(child)})`;
      } else {
        const rule = child;
        return `${rule.field.replaceAll('${', '').replaceAll('}', '')} ${rule.operator} ${rule.value
          .replaceAll('${', '')
          .replaceAll('}', '')}`;
      }
    });

    if (subgroup.not) {
      return `!(${subgroup.type === 'and' ? conditions.join(' && ') : conditions.join(' || ')})`;
    } else {
      return subgroup.type === 'and' ? conditions.join(' && ') : conditions.join(' || ');
    }
  } else {
    const rule = group as Rule;
    return `${rule.field.replaceAll('${', '').replaceAll('}', '')} ${rule.operator} ${rule.value
      .replaceAll('${', '')
      .replaceAll('}', '')}`;
  }
};

export const saveFlow = async ({
  name,
  edges,
  nodes,
  onSuccess,
  onError,
  description,
  slot,
  isCommon,
  serviceId,
  isNewService,
  status = 'ready',
  showError = true,
}: SaveFlowConfig) => {
  try {
    let yamlContent = getYamlContent(nodes, edges, name, description, showError);

    const mcqNodes = nodes.filter(
      (node) => node.data?.stepType === StepType.MultiChoiceQuestion,
    ) as Node<NodeDataProps>[];

    if (mcqNodes.length > 0) {
      const nodesUpToFirstMcq = nodes.slice(
        0,
        nodes.findIndex((node) => node.data?.stepType === StepType.MultiChoiceQuestion) + 1,
      );
      yamlContent = getYamlContent(nodesUpToFirstMcq, edges, name, description, showError);
    }

    await saveService(
      yamlContent,
      { name, serviceId, description, slot, isCommon, nodes, edges, isNewService } as SaveFlowConfig,
      true,
      status,
      onSuccess,
      onError,
    );

    for (const mcqNode of mcqNodes) {
      const mcqEdges = edges.filter((edge) => edge.source === mcqNode.id);

      for (const edge of mcqEdges) {
        const nextNode = nodes.find((n) => n.id === edge.target);
        if (!nextNode) continue;

        const buttonIndex = mcqNode?.data?.multiChoiceQuestion?.buttons.findIndex((e: any) => e.title === edge.label);
        const mcqNodeId = getLastDigits(toSnakeCase(mcqNode.data.label ?? ''));
        const serviceName = `${name}_mcq_${mcqNodeId}_${buttonIndex}`;
        const branchNodes = getBranchNodes(nodes, edges, nextNode);
        const branchEdges = edges.filter((edge) =>
          branchNodes.some((n: any) => n.id === edge.source || n.id === edge.target),
        );

        await saveService(
          getYamlContent(branchNodes, branchEdges, serviceName, description, showError),
          { name: serviceName, serviceId, description, slot, isCommon, nodes, edges, isNewService } as SaveFlowConfig,
          false,
          status,
        );
      }
    }
  } catch (e: any) {
    onError(e);
  }
};

async function saveService(
  content: any,
  config: SaveFlowConfig,
  updateServiceDb: boolean,
  status: 'draft' | 'ready' = 'ready',
  onSuccess?: (e: any) => void,
  onError?: (e: any) => void,
) {
  const { isNewService, serviceId, name, description, slot, isCommon, edges, nodes } = config;
  if (updateServiceDb) {
    useServiceStore.getState().changeServiceName(removeTrailingUnderscores(name));
  }
  await api
    .post(
      isNewService ? createNewService() : editService(serviceId),
      {
        name: removeTrailingUnderscores(name),
        serviceId,
        description,
        slot,
        type: 'POST',
        content: content,
        isCommon,
        structure: JSON.stringify({ edges, nodes }),
        updateServiceDb: updateServiceDb,
        state: status,
      },
      {
        params: {
          location: `${import.meta.env.REACT_APP_RUUTER_SERVICES_POST_PATH}/${name}.yml`,
        },
      },
    )
    .then(onSuccess)
    .catch(onError);
}

function getYamlContent(
  nodes: Node<NodeDataProps>[],
  edges: Edge[],
  name: string,
  description: string,
  showError = true,
): any {
  const allRelations: any[] = [];

  nodes.forEach((node) => {
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);

    outgoingEdges.forEach((edge) => {
      const followingNode = nodes.find((n) => n.id === edge.target)?.data;
      let error;

      switch (followingNode?.stepType) {
        case StepType.Textfield:
          if (followingNode?.message === undefined) {
            error = i18next.t('toast.missing-textfield-message');
          }
          break;
        case StepType.OpenWebpage:
          if (followingNode?.link === undefined || followingNode?.linkText === undefined) {
            error = i18next.t('toast.missing-website');
          }
          break;
        case StepType.FileGenerate:
          if (followingNode?.fileName === undefined || followingNode?.fileContent === undefined) {
            error = i18next.t('toast.missing-file-generation');
          }
          break;
        case StepType.Assign:
          if (followingNode?.assignElements === undefined || followingNode?.assignElements?.length === 0) {
            error = i18next.t('toast.missing-assign-elements');
          }
          break;
        case StepType.MultiChoiceQuestion:
          if (
            followingNode?.multiChoiceQuestion?.question === undefined ||
            followingNode?.multiChoiceQuestion.question === ''
          ) {
            error = i18next.t('toast.missing-mcq-question');
            break;
          }
          if (!followingNode?.multiChoiceQuestion?.buttons || followingNode?.multiChoiceQuestion.buttons.length === 0) {
            error = i18next.t('toast.missing-mcq-options');
          }
          break;
        case StepType.DynamicChoices:
          if (followingNode?.dynamicChoices?.list === undefined || followingNode?.dynamicChoices.list === '') {
            error = i18next.t('toast.missing-dynamic-choices-list');
            break;
          }
          if (
            followingNode?.dynamicChoices?.serviceName === undefined ||
            followingNode?.dynamicChoices.serviceName === ''
          ) {
            error = i18next.t('toast.missing-dynamic-choices-service-name');
            break;
          }
          if (followingNode?.dynamicChoices?.key === undefined || followingNode?.dynamicChoices.key === '') {
            error = i18next.t('toast.missing-dynamic-choices-key');
          }
          break;
        case StepType.Condition: {
          const invalidRulesExist = hasInvalidRules(followingNode?.rules?.children ?? []);
          const isInvalid =
            followingNode?.rules?.children === undefined ||
            invalidRulesExist ||
            followingNode?.rules?.children.length === 0;
          if (isInvalid) {
            error = i18next.t('toast.missing-condition-rules');
          }
          break;
        }
        case StepType.Input:
          if (followingNode?.type === 'placeholder' && !allRelations.includes(node.id)) {
            allRelations.push(node.id);
            return;
          }
          break;
      }

      if (error && showError) {
        throw new Error(error);
      }

      allRelations.push(`${edge.source},${edge.target}`);
    });
  });
  // find finishing nodes
  edges.forEach((edge) => {
    const current = edges.find((lastEdge) => lastEdge.source === edge.source);
    const nextStep = edges.find((lastEdge) => lastEdge.source === edge.target);
    if (!nextStep && current?.type !== 'placeholder') allRelations.push(edge.target);
  });

  const finishedFlow = new Map();

  finishedFlow.set('declaration', {
    call: 'declare',
    version: 0.1,
    description: description ?? `Description placeholder for '${name ?? ''}'`,
    method: 'post',
    accepts: 'json',
    returns: 'json',
    namespace: 'service',
    allowList: {
      body: [
        {
          field: 'chatId',
          type: 'string',
          description: 'The chat ID for the message',
        },
        {
          field: 'authorId',
          type: 'string',
          description: 'The author ID for the message',
        },
        {
          field: 'input',
          type: 'object',
          description: 'The Input from the user',
        },
      ],
    },
  });

  const firstNode = nodes.find((node) => node.type === 'custom');
  finishedFlow.set('prepare', {
    assign: {
      chatId: '${incoming.body.chatId}',
      authorId: '${incoming.body.authorId}',
      input: '${incoming.body.input}',
      buttons: [],
      res: {
        result: '',
      },
    },
    next: firstNode ? toSnakeCase(firstNode.data.label?.toString() ?? 'format_messages') : 'format_messages',
  });

  try {
    allRelations.forEach((r) => {
      const [parentNodeId, childNodeId] = r.split(',');
      const parentNode = nodes.findLast((node) => node.id === parentNodeId) as Node<NodeDataProps> | undefined;
      if (
        !parentNode ||
        parentNode.type !== 'custom' ||
        [StepType.Rule, StepType.RuleDefinition].includes(parentNode.data.stepType)
      ) {
        return;
      }

      const childNode = nodes.find((node) => node.id === childNodeId) as Node<NodeDataProps> | undefined;
      const parentStepName = toSnakeCase(parentNode.data.label);

      if (parentNode.data.stepType === StepType.Textfield) {
        return handleTextField(finishedFlow, parentStepName, parentNode, childNode);
      }

      if (parentNode.data.stepType === StepType.Assign) {
        return handleAssignStep(parentNode, finishedFlow, parentStepName, childNode);
      }

      if (parentNode.data.stepType === StepType.Condition) {
        return handleConditionStep(allRelations, parentNodeId, nodes, parentNode, finishedFlow, parentStepName);
      }

      if (parentNode.data.stepType === StepType.Input) {
        return;
      }

      if (parentNode.data.stepType === StepType.MultiChoiceQuestion) {
        return handleMultiChoiceQuestion(finishedFlow, parentStepName, parentNode, childNode);
      }

      if (parentNode.data.stepType === StepType.DynamicChoices) {
        return handleDynamicChoices(finishedFlow, parentStepName, parentNode, childNode);
      }

      if (parentNode.data.stepType === StepType.UserDefined) {
        return handleEndpointStep(parentNode, finishedFlow, parentStepName, childNode);
      }

      const nextStep = childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages';
      const template = getTemplate(parentNode, parentStepName, nextStep);

      finishedFlow.set(parentStepName, template);
    });
  } catch (e: any) {
    if (showError) {
      throw new Error(i18next.t('toast.cannot-save-flow') ?? e?.message ?? 'Error');
    }
  }

  finishedFlow.set('format_messages', {
    call: 'http.post',
    args: {
      url: '[#SERVICE_DMAPPER_HBS]/bot_responses_to_messages',
      headers: {
        type: 'json',
      },
      body: {
        data: {
          botMessages: '${[res]}',
          chatId: "${chatId ?? ''}",
          authorId: "${authorId ?? ''}",
          authorFirstName: '',
          authorLastName: '',
          authorTimestamp: '${new Date().toISOString()}',
          created: '${new Date().toISOString()}',
          buttons: '${buttons ?? []}',
        },
      },
    },
    result: 'formatMessage',
    next: 'service-end',
  });

  finishedFlow.set('service-end', {
    return: "${formatMessage.response.body ?? ''}",
  });

  return Object.fromEntries(finishedFlow.entries());
}

function getBranchNodes(nodes: Node[], edges: Edge[], startNode: Node): Node[] {
  const branchNodes: Node[] = [startNode];
  const visited = new Set<string>([startNode.id]);
  const queue: string[] = [startNode.id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const currentNode = nodes.find((n) => n.id === currentId);
    if (currentNode?.data?.stepType === StepType.MultiChoiceQuestion) {
      continue;
    }

    const outgoingEdges = edges.filter((edge) => edge.source === currentId);

    for (const edge of outgoingEdges) {
      if (visited.has(edge.target)) continue;

      const nextNode = nodes.find((node) => node.id === edge.target);
      if (!nextNode) continue;

      branchNodes.push(nextNode);
      visited.add(nextNode.id);
      queue.push(nextNode.id);
    }
  }

  return branchNodes;
}

function handleTextField(
  finishedFlow: Map<any, any>,
  parentStepName: string,
  parentNode: Node,
  childNode: Node<NodeDataProps> | undefined,
) {
  const htmlToMarkdown = new NodeHtmlMarkdown({
    textReplace: [
      [/\\_/g, '_'],
      [/\\\[/g, '['],
      [/\\\]/g, ']'],
    ],
  });

  finishedFlow.set(parentStepName, {
    assign: {
      res: {
        result: `${htmlToMarkdown.translate(
          typeof parentNode.data.message === 'string'
            ? parentNode.data.message.replace('{{', '${').replace('}}', '}')
            : '',
        )}`,
      },
    },
    next: childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages',
  });
}

function handleConditionStep(
  allRelations: any[],
  parentNodeId: any,
  nodes: Node[],
  parentNode: Node<NodeDataProps>,
  finishedFlow: Map<any, any>,
  parentStepName: string,
) {
  const conditionRelations: string[] = allRelations.filter((r) => r.startsWith(parentNodeId));
  const firstChildNode = conditionRelations[0].split(',')[1];
  const secondChildNode = conditionRelations[1].split(',')[1];

  const firstChild = nodes.find((node) => node.id === firstChildNode) as Node<NodeDataProps> | undefined;
  const secondChild = nodes.find((node) => node.id === secondChildNode) as Node<NodeDataProps> | undefined;

  const invalidRulesExist = hasInvalidRules(parentNode.data.rules?.children ?? []);
  const isInvalid =
    parentNode.data.rules?.children === undefined || invalidRulesExist || parentNode.data.rules?.children.length === 0;
  if (isInvalid) {
    throw new Error(i18next.t('toast.missing-condition-rules') ?? 'Error');
  }

  finishedFlow.set(parentStepName, {
    switch: [
      {
        condition: `\${${buildConditionString(parentNode.data.rules)}}`,
        next: toSnakeCase(firstChild?.data?.label ?? '') ?? '',
      },
    ],
    next: toSnakeCase(secondChild?.data?.label ?? '') ?? '',
  });
}

function handleAssignStep(
  parentNode: Node<NodeDataProps>,
  finishedFlow: Map<any, any>,
  parentStepName: string,
  childNode: Node<NodeDataProps> | undefined,
) {
  const invalidElementsExist = hasInvalidElements(parentNode.data.assignElements ?? []);
  const isInvalid =
    parentNode.data?.assignElements === undefined ||
    invalidElementsExist ||
    parentNode.data?.assignElements.length === 0;

  if (isInvalid) {
    throw new Error(i18next.t('toast.missing-assign-elements') ?? 'Error');
  }

  finishedFlow.set(parentStepName, {
    assign: parentNode.data.assignElements.reduce((acc: any, e: any) => {
      acc[e.key] = e.value;
      return acc;
    }, {}),
    next: childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages',
  });
}

function handleEndpointStep(
  parentNode: Node<NodeDataProps>,
  finishedFlow: Map<any, any>,
  parentStepName: string,
  childNode: Node<NodeDataProps> | undefined,
) {
  const endpointDefinition = parentNode.data.endpoint?.definitions[0];
  const paramsVariables = endpointDefinition?.params?.variables;
  const bodyVariables = endpointDefinition?.body?.variables;
  const headersVariables = endpointDefinition?.headers?.variables;
  const methodType = endpointDefinition?.methodType?.toLowerCase();

  const stepConfig: any = {
    call: `http.${methodType ?? 'post'}`,
    args: {
      url: endpointDefinition?.url?.split('?')[0] ?? '',
    },
    result: `${parentNode.data.endpoint?.name.replaceAll(' ', '_')}_res`,
    next: childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages',
  };

  if (Array.isArray(paramsVariables) && paramsVariables.length > 0) {
    stepConfig.args.query = paramsVariables.reduce((acc: any, e: any) => {
      acc[e.name] = e.value;
      return acc;
    }, {});
  }

  if (Array.isArray(bodyVariables) && bodyVariables.length > 0) {
    stepConfig.args.body = bodyVariables.reduce((acc: any, e: any) => {
      acc[e.name] = e.value;
      return acc;
    }, {});
  }

  if (Array.isArray(headersVariables) && headersVariables.length > 0) {
    stepConfig.args.headers = headersVariables.reduce((acc: any, e: any) => {
      acc[e.name] = e.value;
      return acc;
    }, {});
  }

  finishedFlow.set(parentStepName, stepConfig);
}

function handleMultiChoiceQuestion(
  finishedFlow: Map<any, any>,
  parentStepName: string,
  parentNode: Node<NodeDataProps>,
  childNode: Node<NodeDataProps> | undefined,
) {
  return finishedFlow.set(parentStepName, {
    assign: {
      buttons: parentNode?.data?.multiChoiceQuestion?.buttons ?? [],
      res: {
        result: parentNode?.data?.multiChoiceQuestion?.question ?? '',
      },
    },
    next: childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages',
  });
}

function handleDynamicChoices(
  finishedFlow: Map<any, any>,
  parentStepName: string,
  parentNode: Node<NodeDataProps>,
  childNode: Node<NodeDataProps> | undefined,
) {
  const list = parentNode.data.dynamicChoices?.list ?? '';
  finishedFlow.set(parentStepName, {
    call: 'http.post',
    args: {
      url: '[#SERVICE_DMAPPER]/generate/buttons-list',
      body: {
        list: stringToArray(list, list),
        service_name: parentNode.data.dynamicChoices?.serviceName ?? '',
        key: parentNode.data.dynamicChoices?.key ?? '',
        payload_prefix: '#service, /POST/services/active/',
        payload_keys: parentNode.data.dynamicChoices?.payloadKeys.split(',').filter((item) => item.trim()) ?? [],
      },
    },
    result: 'dynamic_choices_res',
    next: 'assign_dynamic_choices_buttons',
  });

  return finishedFlow.set('assign_dynamic_choices_buttons', {
    assign: {
      buttons: '${dynamic_choices_res.response.body.response ?? []}',
    },
    next: childNode ? toSnakeCase(childNode.data.label ?? 'format_messages') : 'format_messages',
  });
}

const getMapEntry = (value: string) => {
  const secrets = useServiceStore.getState().secrets;

  const parts = value.replace('{{', '').replace('}}', '').split('.');
  const key = value.replace('{{', '"').replace('}}', '"');
  if ([...(secrets?.prod ?? []), ...(secrets?.test ?? [])].includes(value)) {
    return `[${key}, secrets.response.body.${parts.join('.')}]`;
  }
  if (!value.includes('ClientInput')) parts.splice(1, 0, 'response', 'body');
  return `[${key}, ${parts.join('.')}]`;
};

const getNestedPreDefinedRawVariables = (data: { [key: string]: any }, result: string[]) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === 'object') {
      return getNestedPreDefinedRawVariables(data[k], result);
    }
    if (typeof data[k] === 'string' && data[k].startsWith('{{')) {
      result.push(getMapEntry(data[k]));
    }
  });
};

const getNestedPreDefinedEndpointVariables = (variable: EndpointVariableData, result: string[]) => {
  const variableData = variable.type === 'schema' ? variable.schemaData : variable.arrayData;
  if (variableData instanceof Array) {
    variableData.forEach((v) => {
      if (['schema', 'array'].includes(v.type)) getNestedPreDefinedEndpointVariables(v, result);

      if (v.value?.startsWith('{{')) result.push(getMapEntry(v.value));
      if (v.testValue?.startsWith('{{')) result.push(getMapEntry(v.testValue));
    });
  }
};

const getTemplate = (node: Node, stepName: string, nextStep?: string) => {
  const data = getTemplateDataFromNode(node);

  return {
    template: `${data?.templateName}`,
    requestType: 'templates',
    body: data?.body,
    result: data?.resultName ?? `${stepName}_result`,
    next: nextStep ?? 'format_messages',
  };
};

const getTemplateDataFromNode = (node: Node): { templateName: string; body?: any; resultName?: string } | undefined => {
  if (node.data.stepType === StepType.Auth) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/tara',
      resultName: 'TARA',
    };
  }
  if (node.data.stepType === StepType.Input) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/client-input',
      resultName: `client_input_${node.data.clientInputId}_result`,
    };
  }
  if (node.data.stepType === StepType.FileGenerate) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/file-generate',
      body: {
        fileName: node.data.fileName ?? '',
        fileContent: node.data.fileContent ?? '',
      },
    };
  }
  if (node.data.stepType === StepType.FileSign) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/siga',
      body: {
        type: 'smart_id',
        country: 'EE',
      },
      resultName: 'SiGa',
    };
  }
  if (node.data.stepType === StepType.FinishingStepRedirect) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/direct-to-cs',
      body: {
        message: node.data.message ?? '',
      },
    };
  }
  if (node.data.stepType === StepType.FinishingStepEnd) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/end-conversation',
      body: {
        message: node.data.message ?? '',
      },
    };
  }
  if (node.data.stepType === StepType.OpenWebpage) {
    return {
      templateName: '[#SERVICE_PROJECT_LAYER]/open-webpage',
      body: {
        link: node.data.link ?? '',
        linkText: node.data.linkText ?? '',
      },
    };
  }
};

export const saveFlowClick = async (status: 'draft' | 'ready' = 'ready', showError: boolean = true) => {
  const name = removeTrailingUnderscores(useServiceStore.getState().serviceNameDashed());
  const serviceId = useServiceStore.getState().serviceId;
  const description = useServiceStore.getState().description;
  const slot = useServiceStore.getState().slot;
  const isCommon = useServiceStore.getState().isCommon;
  const isNewService = useServiceStore.getState().isNewService;
  const edges = useServiceStore.getState().edges;
  const nodes = useServiceStore.getState().nodes;

  await saveFlow({
    name: !name
      ? `${t('newService.defaultServiceName').toString()}_${format(new Date(), 'dd_MM_yyyy_HH_mm_ss')}`
      : name,
    edges,
    nodes,
    onSuccess: () => {
      useToastStore.getState().success({
        title: i18next.t('newService.toast.success'),
        message: i18next.t('newService.toast.savedSuccessfully'),
      });
      useServiceStore.getState().enableTestButton();
    },
    onError: (e: AxiosError) => {
      useToastStore.getState().error({
        title: i18next.t('newService.toast.failed'),
        message: e.response?.status === 409 ? t('newService.toast.serviceNameAlreadyExists') : e?.message,
      });
      throw new Error(
        e.response?.status === 409 ? t('newService.toast.serviceNameAlreadyExists').toString() : e?.message,
      );
    },
    description,
    slot,
    isCommon,
    serviceId,
    isNewService,
    status,
    showError,
  });
};

export const editServiceInfo = async () => {
  const name = removeTrailingUnderscores(useServiceStore.getState().serviceNameDashed());
  const description = useServiceStore.getState().description;
  const serviceId = useServiceStore.getState().serviceId;
  const slot = useServiceStore.getState().slot;

  const tasks: Promise<any>[] = [];

  tasks.push(
    api.post(editService(serviceId), {
      name,
      description,
      slot,
      type: 'POST',
      updateServiceDb: true,
      state: 'ready',
    }),
  );

  await Promise.all(tasks)
    .then(() =>
      useToastStore.getState().success({
        title: i18next.t('newService.toast.success'),
        message: i18next.t('newService.toast.savedSuccessfully'),
      }),
    )
    .catch((e) => {
      useToastStore.getState().error({
        title: i18next.t('newService.toast.saveFailed'),
        message: e?.message,
      });
    });
};
