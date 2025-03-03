import axios from "axios";
import { Assign } from "components/FlowElementsPopup/AssignBuilder/assign-types";
import { Group, Rule } from "components/FlowElementsPopup/RuleBuilder/types";
import i18next from "i18next";
import { Edge, Node } from "reactflow";
import { createNewService, editService, updateServiceEndpoints, jsonToYml, testService } from "resources/api-constants";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";
import { RawData, Step, StepType } from "types";
import { EndpointData, EndpointEnv, EndpointType, EndpointVariableData } from "types/endpoint";
import { NodeHtmlMarkdown } from "node-html-markdown";

// refactor this file later

const getEndpointVariables = (
  key: string,
  data?: {
    variables: EndpointVariableData[];
    rawData: RawData;
  }
): { [key: string]: any } => {
  if (!data) return {};
  const result: { [key: string]: any } = {};
  data.variables.forEach((v) => {
    if (["schema", "array"].includes(v.type)) {
      if (v.type === "array" && v.arrayType !== "schema") {
        if (v.value) result[v.name] = `\${[info.response.body.${key}["${v.name}"]]}`;
        return;
      }
      const nestedResult: string[] = [];
      getNestedVariables(v, key, v.name, nestedResult);
      result[v.name] = `\${new Map([${nestedResult}])}`;
      return;
    }
    if (v.value) result[v.name] = `\${info.response.body.${key}["${v.name}"]}`;
  });
  if (Object.keys(result).length === 0) {
    try {
      [data.rawData.value, data.rawData.testValue].forEach((rawData) => {
        if (!rawData) return;
        const parsedData = JSON.parse(rawData);
        Object.keys(parsedData).forEach((k) => {
          if (typeof parsedData[k] === "object") {
            const nestedResult: string[] = [];
            getNestedRawData(parsedData[k], key, k, nestedResult);
            result[k] = `\${new Map([${nestedResult}])}`;
            return;
          }
          result[k] = `\${info.response.body.${key}["${k}"]}`;
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
  return result;
};

const getNestedVariables = (variable: EndpointVariableData, key: string, path: string, result: string[]) => {
  const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
  if (variableData instanceof Array) {
    variableData.forEach((v) => {
      if (["schema", "array"].includes(v.type)) {
        getNestedVariables(v, key, `${path}.${v.name}`, result);
        return;
      }
      result.push(`["${path}.${v.name}", info.response.body.${key}["${path}.${v.name}"]]`);
    });
  }
};

const getNestedRawData = (data: { [key: string]: any }, key: string, path: string, result: string[]) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === "object") {
      getNestedRawData(data[k], key, `${path}.${k}`, result);
      return;
    }
    result.push(`["${path}.${k}", info.response.body.${key}["${path}.${k}"]]`);
  });
};

// Since we currently cannot mark variables as sensitive from GUI, we set all as sensitive
const saveEndpointInfo = async (
  selectedEndpoint: EndpointType,
  env: EndpointEnv,
  endpointName: string,
  endpoint: EndpointData
) => {
  await saveEndpointConfig(selectedEndpoint, env, endpointName, endpoint);

  const steps = new Map();
  steps.set("get-configs", {
    call: "http.post",
    args: {
      url: `${import.meta.env.REACT_APP_API_URL}/services/endpoints/configs/${
        endpoint.isCommon ? "common/" : ""
      }${endpointName}-${env === EndpointEnv.Live ? "prod" : "test"}-configs`,
      body: {
        params: "${incoming.body.params}",
        headers: "${incoming.body.headers}",
        body: "${incoming.body.body}",
      },
    },
    result: "configs",
  });
  steps.set("return_value", {
    wrapper: false,
    return: "${configs.response.body}",
  });
  const result = Object.fromEntries(steps.entries());

  await axios
    .post(
      jsonToYml(),
      { result },
      {
        params: {
          location: `${import.meta.env.REACT_APP_RUUTER_SERVICES_POST_PATH}/endpoints/info/${
            endpoint.isCommon ? "common/" : ""
          }${endpointName}-${env === EndpointEnv.Live ? "prod" : "test"}-info.yml`,
        },
      }
    )
    .then(console.log)
    .catch(console.log);
};

const saveEndpointConfig = async (
  endpoint: EndpointType,
  env: EndpointEnv,
  endpointName: string,
  data: EndpointData
) => {
  const headers = rawDataIfVariablesMissing(
    endpoint,
    "headers",
    env,
    assignEndpointVariables(env, "headers", endpoint.headers)
  );
  const body = rawDataIfVariablesMissing(endpoint, "body", env, assignEndpointVariables(env, "body", endpoint.body));
  const params = rawDataIfVariablesMissing(
    endpoint,
    "params",
    env,
    assignEndpointVariables(env, "params", endpoint.params)
  );
  const steps = new Map();
  const variables: { [key: string]: string } = {};
  assignValues(headers, "headers", variables);
  assignValues(body, "body", variables);
  assignValues(params, "params", variables);
  steps.set("prepare_step", {
    assign: variables,
  });
  const bodyStr = Object.keys(body ?? {}).map((b) => `["${b.replaceAll("__", ".")}", body_${b}]`);
  steps.set("combine_step", {
    assign: {
      sensitive: `\${new Map([${
        typeof headers === "string"
          ? `["headers", headers]`
          : `["headers", new Map([${Object.keys(headers ?? {}).map(
              (h) => `["${h.replaceAll("__", ".")}", headers_${h}]`
            )}])]`
      }, ${typeof body === "string" ? `["body", body]` : `["body", new Map([${bodyStr}])]`}, ${
        typeof params === "string"
          ? `["params", params]`
          : `["params", new Map([${Object.keys(params ?? {}).map(
              (p) => `["${p.replaceAll("__", ".")}", params_${p}]`
            )}])]`
      }])}`,
    },
  });
  steps.set("return_value", { wrapper: false, return: "${sensitive}" });
  const result = Object.fromEntries(steps.entries());

  await axios
    .post(
      jsonToYml(),
      { result },
      {
        params: {
          location: `${import.meta.env.REACT_APP_RUUTER_SERVICES_POST_PATH}/endpoints/configs/${
            data.isCommon ? "common/" : ""
          }${endpointName}-${env === EndpointEnv.Live ? "prod" : "test"}-configs.yml`,
        },
      }
    )
    .then(console.log)
    .catch(console.log);
};

const rawDataIfVariablesMissing = (
  endpoint: EndpointType,
  key: "headers" | "body" | "params",
  env: EndpointEnv,
  data: { [key: string]: string }
): { [key: string]: any } | string => {
  if (Object.keys(data).length > 0) return data;
  const rawData =
    endpoint[key]?.rawData[env === EndpointEnv.Live ? "value" : "testValue"] ?? endpoint[key]?.rawData.value ?? "";
  try {
    assignNestedRawVariables(JSON.parse(rawData), key, "", data);
    return data;
  } catch (e) {
    return "";
  }
};
const assignValues = (data: string | { [key: string]: string }, key: string, variables: { [key: string]: string }) => {
  if (typeof data === "string") variables[key] = data;
  else
    Object.keys(data).forEach((v) => {
      variables[`${key}_${v}`] = data[v];
    });
};

const assignNestedRawVariables = (
  data: { [key: string]: any },
  key: string,
  path: string,
  result: { [key: string]: string }
) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === "object") {
      return assignNestedRawVariables(data[k], key, path.length === 0 ? k : `${path}__${k}`, result);
    }
    result[path.length > 0 ? `${path}__${k}` : k] =
      typeof data[k] === "string" && data[k].startsWith("{{")
        ? data[k].replace("{{", `\${incoming.body.${key}["`).replace("}}", `"]}`)
        : data[k];
  });
};

const assignNestedVariable = (
  variable: EndpointVariableData,
  key: string,
  env: EndpointEnv,
  path: string,
  result: { [key: string]: string }
) => {
  const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
  if (variableData instanceof Array) {
    variableData.forEach((v) => {
      if (["schema", "array"].includes(v.type)) assignNestedVariable(v, key, env, `${path}__${v.name}`, result);
      if (!v.value) return;

      result[`${path}__${v.name}`] = (env === EndpointEnv.Test && v.testValue ? v.testValue : v.value)
        .replace("{{", `\${incoming.body.${key}["`)
        .replace("}}", `"]}`);
    });
  }
};

const assignEndpointVariables = (
  env: EndpointEnv,
  key: string,
  data?: { variables: EndpointVariableData[]; rawData: RawData }
): { [key: string]: string } => {
  if (!data) return {};
  const result: { [key: string]: string } = {};
  data.variables.forEach((v) => {
    if (!v.value) {
      assignNestedVariable(v, key, env, v.name, result);
      return;
    }
    // if test value is missing use live value
    result[v.name] = (env === EndpointEnv.Test && v.testValue ? v.testValue : v.value)
      .replace("{{", `\${incoming.body.${key}["`)
      .replace("}}", `"]}`);
  });
  return result;
};

export async function saveEndpoints(
  endpoints: EndpointData[],
  name: string,
  id: string,
  onSuccess?: (e: any) => void,
  onError?: (e: any) => void
) {
  const tasks: Promise<any>[] = [];
  const serviceEndpoints = endpoints.filter((e) => e.serviceId === id || !e.hasOwnProperty("serviceId")).map((x) => x);

  for (const endpoint of serviceEndpoints) {
    if (!endpoint) continue;
    endpoint.serviceId = id;
    const selectedEndpointType = endpoint.definedEndpoints.find((e) => e.isSelected);
    if (!selectedEndpointType) continue;

    const endpointName = `${name.replaceAll(" ", "_")}-${
      (endpoint.name.trim().length ?? 0) > 0 ? endpoint?.name.replaceAll(" ", "_") : endpoint?.id
    }`;
    for (const env of [EndpointEnv.Live, EndpointEnv.Test]) {
      await saveEndpointInfo(selectedEndpointType, env, endpointName, endpoint);
    }
    const steps = buildSteps(endpointName, endpoint, selectedEndpointType);
    const result = Object.fromEntries(steps.entries());

    const isCommonPath = endpoint.isCommon ? "common/" : "";

    tasks.push(
      axios.post(
        jsonToYml(),
        { result },
        {
          params: {
            location: `${
              import.meta.env.REACT_APP_RUUTER_SERVICES_PATH
            }/${selectedEndpointType.methodType.toUpperCase()}/${
              import.meta.env.REACT_APP_RUUTER_SERVICES_DIR_PATH
            }/endpoints/${isCommonPath}${endpointName}.yml`,
          },
        }
      )
    );
  }

  tasks.push(
    axios.post(updateServiceEndpoints(id), {
      endpoints: JSON.stringify(serviceEndpoints),
    })
  );

  await Promise.all(tasks).then(onSuccess).catch(onError);
}

const buildSteps = (endpointName: string, endpoint: EndpointData, selectedEndpointType: EndpointType) => {
  const steps = new Map();
  steps.set("extract_request_data", {
    assign: {
      type: "${incoming.params.type}",
    },
    next: "check_for_type",
  });
  steps.set("check_for_type", {
    switch: [{ condition: "${type == null}", next: "return_no_type_error" }],
    next: "check_for_environment",
  });
  steps.set("check_for_environment", {
    switch: [{ condition: "${type.toLowerCase() == 'prod'}", next: "get_prod_info" }],
    next: "get_test_info",
  });
  steps.set("get_prod_info", {
    call: "http.post",
    args: {
      url: `${import.meta.env.REACT_APP_API_URL}/services/endpoints/info/${
        endpoint.isCommon ? "common/" : ""
      }${endpointName}-prod-info`,
      body: {
        params: "${incoming.body != null ? incoming.body.params ?? new Map() : new Map()}",
        headers: "${incoming.body != null ? incoming.body.headers ?? new Map() : new Map()}",
        body: "${incoming.body != null ? incoming.body.body ?? new Map() : new Map()}",
      },
    },
    result: "info",
    next: "assign_endpoint_url",
  });
  steps.set("get_test_info", {
    call: `http.post`,
    args: {
      url: `${import.meta.env.REACT_APP_API_URL}/services/endpoints/info/${
        endpoint.isCommon ? "common/" : ""
      }${endpointName}-test-info`,
      body: {
        params: "${incoming.body != null ? incoming.body.params ?? new Map() : new Map()}",
        headers: "${incoming.body != null ? incoming.body.headers ?? new Map() : new Map()}",
        body: "${incoming.body != null ? incoming.body.body ?? new Map() : new Map()}",
      },
    },
    result: "info",
    next: "assign_endpoint_url",
  });
  const endpointParams = getEndpointVariables("params", selectedEndpointType.params);
  const endpointHeaders = getEndpointVariables("headers", selectedEndpointType.headers);
  const endpointBody = getEndpointVariables("body", selectedEndpointType.body);
  const headers = Object.keys(endpointHeaders).length > 0 ? endpointHeaders : undefined;
  const body = Object.keys(endpointBody).length > 0 ? endpointBody : undefined;

  let endpointUrl = selectedEndpointType.url;
  if (endpointUrl?.includes("{")) {
    const variable = selectedEndpointType.url?.slice(
      selectedEndpointType.url?.indexOf("{") + 1,
      selectedEndpointType.url.indexOf("}")
    );
    endpointUrl = selectedEndpointType.url?.replace(`{${variable}}`, endpointParams[variable ?? ""]);
  }
  steps.set("assign_endpoint_url", {
    assign: {
      endpoint_url: endpointUrl,
    },
    next: "execute_endpoint",
  });
  steps.set("execute_endpoint", {
    call: selectedEndpointType.methodType.toLowerCase() === "get" ? "http.get" : "http.post",
    args: {
      url: "${endpoint_url}",
      headers,
      body,
    },
    result: "res",
    next: "return_result",
  });
  steps.set("return_result", {
    wrapper: false,
    return: "${res.response.body}",
    next: "end",
  });
  steps.set("return_no_type_error", {
    status: "400",
    return: "Please Specify Endpoint Type 'prod' Or 'test'",
    next: "end",
  });

  return steps;
};

interface SaveFlowConfig {
  steps: Step[];
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
}

const hasInvalidRules = (elements: any[]): boolean => {
  return elements.some((e) => {
    if ("children" in e) {
      const group = e as Group;
      if (group.children.length === 0) return true;
      return hasInvalidRules(group.children);
    } else {
      const rule = e as Rule;
      return rule.value === "" || rule.field === "" || rule.operator === "";
    }
  });
};

const hasInvalidElements = (elements: any[]): boolean => {
  return elements.some((e) => {
    const element = e as Assign;
    return element.key === "" || element.value === "";
  });
};

const buildConditionString = (group: any): string => {
  if ("children" in group) {
    const subgroup = group as Group;
    if (subgroup.children.length === 0) {
      return "";
    }

    const conditions = subgroup.children.map((child) => {
      if ("children" in child) {
        return `(${buildConditionString(child)})`;
      } else {
        const rule = child;
        return `${rule.field.replaceAll("${", "").replaceAll("}", "")} ${rule.operator} ${rule.value
          .replaceAll("${", "")
          .replaceAll("}", "")}`;
      }
    });

    if (subgroup.not) {
      return `!(${subgroup.type === "and" ? conditions.join(" && ") : conditions.join(" || ")})`;
    } else {
      return subgroup.type === "and" ? conditions.join(" && ") : conditions.join(" || ");
    }
  } else {
    const rule = group as Rule;
    return `${rule.field.replaceAll("${", "").replaceAll("}", "")} ${rule.operator} ${rule.value
      .replaceAll("${", "")
      .replaceAll("}", "")}`;
  }
};

export const saveFlow = async ({
  steps,
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
}: SaveFlowConfig) => {
  try {
    const allRelations: any[] = [];
    // find regular edges 1 -> 1
    const updatedEdges = skipPlaceholderNodes(nodes, edges);
    updatedEdges.forEach((edge) => {
      const node = nodes.find((node) => node.id === edge.source);
      const followingNode = nodes.find((node) => node.id === edge.target);
      if (!node) return;
      let error;
      switch (node.data.stepType) {
        case StepType.Textfield:
          if (node.data.message === undefined) {
            error = i18next.t("toast.missing-textfield-message");
          }
          break;
        case StepType.OpenWebpage:
          if (node.data.link === undefined || node.data.linkText === undefined) {
            error = i18next.t("toast.missing-website");
          }
          break;
        case StepType.FileGenerate:
          if (node.data.fileName === undefined || node.data.fileContent === undefined) {
            error = i18next.t("toast.missing-file-generation");
          }
          break;
        case StepType.Input:
        case StepType.Condition:
          if (followingNode?.type === "placeholder" && !allRelations.includes(node.id)) {
            allRelations.push(node.id);
            return;
          }
          break;
      }

      if (error) {
        throw new Error(error);
      }

      allRelations.push(`${edge.source}-${edge.target}`);
    });
    // find finishing nodes
    updatedEdges.forEach((edge) => {
      const current = updatedEdges.find((lastEdge) => lastEdge.source === edge.source);
      const nextStep = updatedEdges.find((lastEdge) => lastEdge.source === edge.target);
      if (!nextStep && current?.type !== "placeholder") allRelations.push(edge.target);
    });

    const finishedFlow = new Map();

    finishedFlow.set("prepare", {
      assign: {
        chatId: "${incoming.body.chatId}",
        authorId: "${incoming.body.authorId}",
        input: "${incoming.body.input}",
        res: {
          result: "",
        },
      },
      next: "get_secrets",
    });

    finishedFlow.set("get_secrets", {
      call: "http.get",
      args: {
        url: `${import.meta.env.REACT_APP_API_URL}/secrets-with-priority`,
      },
      result: "secrets",
    });
    try {
      allRelations.forEach((r) => {
        const [parentNodeId, childNodeId] = r.split("-");
        const parentNode = nodes.findLast((node) => node.id === parentNodeId);
        if (
          !parentNode ||
          parentNode.type !== "customNode" ||
          [StepType.Rule, StepType.RuleDefinition].includes(parentNode.data.stepType)
        ) {
          return;
        }

        const childNode = nodes.find((node) => node.id === childNodeId);
        const parentStepName = `${parentNode.data.stepType}-${parentNodeId}`;

        if (parentNode.data.stepType === StepType.Textfield) {
          const htmlToMarkdown = new NodeHtmlMarkdown({
            textReplace: [
              [/\\_/g, "_"],
              [/\\\[/g, "["],
              [/\\\]/g, "]"],
            ],
          });

          finishedFlow.set(parentStepName, {
            assign: {
              res: {
                result: `${htmlToMarkdown.translate(parentNode.data.message?.replace("{{", "${").replace("}}", "}"))}`,
              },
            },
            next: childNode ? `${childNode.data.stepType}-${childNodeId}` : childNodeId,
          });

          return;
        }

        if (parentNode.data.stepType === StepType.Assign) {
          const invalidElementsExist = hasInvalidElements(parentNode.data.assignElements || []);
          const isInvalid =
            parentNode.data?.assignElements === undefined ||
            invalidElementsExist ||
            parentNode.data?.assignElements.length === 0;
          if (isInvalid) {
            throw new Error(i18next.t("toast.missing-assign-elements") ?? "Error");
          }

          finishedFlow.set(parentStepName, {
            assign: parentNode.data.assignElements.reduce((acc: any, e: any) => {
              acc[e.key] = e.value;
              return acc;
            }, {}),
            next: childNode ? `${childNode.data.stepType}-${childNodeId}` : childNodeId,
          });
          return;
        }

        if (parentNode.data.stepType === StepType.Condition) {
          const conditionRelations: string[] = allRelations.filter((r) => r.startsWith(parentNodeId));
          const firstChildNode = conditionRelations[0].split("-")[1];
          const secondChildNode = conditionRelations[1].split("-")[1];

          const firstChild = nodes.find((node) => node.id === firstChildNode);
          const secondChild = nodes.find((node) => node.id === secondChildNode);

          const invalidRulesExist = hasInvalidRules(parentNode.data.rules?.children || []);
          const isInvalid =
            parentNode.data.rules?.children === undefined ||
            invalidRulesExist ||
            parentNode.data.rules?.children.length === 0;
          if (isInvalid) {
            throw new Error(i18next.t("toast.missing-condition-rules") ?? "Error");
          }

          finishedFlow.set(parentStepName, {
            switch: [
              {
                condition: `\${${buildConditionString(parentNode.data.rules)}}`,
                next: `${firstChild?.data.stepType}-${firstChildNode}`,
              },
            ],
            next: `${secondChild?.data.stepType}-${secondChildNode}`,
          });
          return;
        }

        if (parentNode.data.stepType === StepType.Input) {
          const invalidRulesExist = hasInvalidRules(parentNode.data.rules?.children || []);
          const isInvalid =
            parentNode.data.rules?.children === undefined ||
            invalidRulesExist ||
            parentNode.data.rules?.children.length === 0;
          if (isInvalid) {
            throw new Error(i18next.t("toast.missing-client_input-rules") ?? "Error");
          }

          const clientInput = `client_input_${parentNode.data.clientInputId}`;
          const clientInputName = `${clientInput}-step`;
          finishedFlow.set(parentStepName, getTemplate(steps, parentNode, clientInputName, `${clientInput}-assign`));
          finishedFlow.set(`${clientInput}-assign`, {
            assign: {
              [clientInput]: `\${${clientInput}_result.input}`,
            },
            next: `${clientInput}-switch`,
          });

          const clientInputYesOrNo = (label: string) => (label === "rule 1" ? '"Yes"' : '"No"');

          const findTargetNodeId = (node: Node) => updatedEdges.find((edge) => edge.source === node.id)?.target;
          const findFollowingNode = (node: Node) => {
            const target = findTargetNodeId(node);
            return nodes.find((n) => n.id === target);
          };

          finishedFlow.set(
            `${clientInput}-switch`,
            getSwitchCase(
              updatedEdges
                .filter((e) => e.source === parentNodeId)
                .map((e) => {
                  const node = nodes.find((node) => node.id === e.target);
                  if (!node) return e.target;
                  const matchingRule = parentNode.data?.rules?.children?.find(
                    (_: never, i: number) => `rule ${i + 1}` === node.data.label
                  );
                  const followingNode = findFollowingNode(node);
                  return {
                    case:
                      matchingRule && !["Yes", "No"].includes(matchingRule?.condition)
                        ? `\${${matchingRule.name.replace("{{", "").replace("}}", "")} ${matchingRule.condition} ${
                            matchingRule.value
                          }}`
                        : `\${${clientInput} == ${clientInputYesOrNo(node.data.label)}}`,
                    nextStep:
                      followingNode?.type === "customNode"
                        ? `${followingNode.data.stepType}-${followingNode.id}`
                        : "service-end",
                  };
                })
            )
          );
          return;
        }

        return finishedFlow.set(
          parentStepName,
          getTemplate(
            steps,
            parentNode,
            parentStepName,
            childNode ? `${childNode.data.stepType}-${childNodeId}` : undefined
          )
        );
      });
    } catch (e: any) {
      useToastStore.getState().error({
        title: i18next.t("toast.cannot-save-flow"),
        message: e?.message,
      });
      return;
    }

    finishedFlow.set("formatMessages", {
      call: "http.post",
      args: {
        url: `${import.meta.env.REACT_APP_SERVICE_DMAPPER}/bot_responses_to_messages`,
        headers: {
          type: "json",
        },
        body: {
          data: {
            botMessages: "${[res]}",
            chatId: "${chatId}",
            authorId: "${authorId}",
            authorFirstName: "",
            authorLastName: "",
            authorTimestamp: "${new Date().toISOString()}",
            created: "${new Date().toISOString()}",
          },
        },
      },
      result: "formatMessage",
      next: "service-end",
    });

    finishedFlow.set("service-end", {
      return: "${formatMessage.response.body ?? ''}",
    });

    const result = Object.fromEntries(finishedFlow.entries());

    await axios
      .post(
        isNewService ? createNewService() : editService(serviceId),
        {
          name,
          serviceId,
          description,
          slot,
          type: "POST",
          content: result,
          isCommon,
          structure: JSON.stringify({ edges, nodes }),
        },
        {
          params: {
            location: `${import.meta.env.REACT_APP_RUUTER_SERVICES_POST_PATH}/tests.yml`,
          },
        }
      )
      .then(onSuccess)
      .catch(onError);

    const endpoints = steps.filter((x) => !!x.data).map((x) => x.data!);
    await saveEndpoints(endpoints, name, serviceId);
  } catch (e: any) {
    onError(e);
    useToastStore.getState().error({
      title: i18next.t("toast.cannot-save-flow"),
      message: e?.message,
    });
  }
};

function skipPlaceholderNodes(nodes: Node[], edges: Edge[]) {
  const nodeMap = nodes.reduce((map: any, node: any) => {
    map[node.id] = node;
    return map;
  }, {});

  const edgeMap = edges.reduce((map: any, edge: any) => {
    if (!map[edge.source]) {
      map[edge.source] = [];
    }
    map[edge.source].push(edge);
    return map;
  }, {});

  function findNextNonPlaceholderNode(nodeId: any) {
    let currentNodeId = nodeId;
    while (nodeMap[currentNodeId] && nodeMap[currentNodeId]?.data?.type === "placeholder") {
      const nextEdges = edgeMap[currentNodeId];
      if (nextEdges && nextEdges.length > 0) {
        currentNodeId = nextEdges[0].target;
      } else {
        break;
      }
    }
    return currentNodeId;
  }

  const modifiedEdges = edges.map((edge: any) => {
    const newTarget = findNextNonPlaceholderNode(edge.target);
    return {
      ...edge,
      target: newTarget,
    };
  });

  const finalEdges = modifiedEdges.filter((edge: any) => nodeMap[edge.target]?.data?.type !== "placeholder");

  return finalEdges;
}

const getMapEntry = (value: string) => {
  const secrets = useServiceStore.getState().secrets;

  const parts = value.replace("{{", "").replace("}}", "").split(".");
  const key = value.replace("{{", '"').replace("}}", '"');
  if ([...(secrets?.prod ?? []), ...(secrets?.test ?? [])].includes(value)) {
    return `[${key}, secrets.response.body.${parts.join(".")}]`;
  }
  if (!value.includes("ClientInput")) parts.splice(1, 0, "response", "body");
  return `[${key}, ${parts.join(".")}]`;
};

const getNestedPreDefinedRawVariables = (data: { [key: string]: any }, result: string[]) => {
  Object.keys(data).forEach((k) => {
    if (typeof data[k] === "object") {
      return getNestedPreDefinedRawVariables(data[k], result);
    }
    if (typeof data[k] === "string" && data[k].startsWith("{{")) {
      result.push(getMapEntry(data[k]));
    }
  });
};

const getNestedPreDefinedEndpointVariables = (variable: EndpointVariableData, result: string[]) => {
  const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
  if (variableData instanceof Array) {
    variableData.forEach((v) => {
      if (["schema", "array"].includes(v.type)) getNestedPreDefinedEndpointVariables(v, result);

      if (v.value?.startsWith("{{")) result.push(getMapEntry(v.value));
      if (v.testValue?.startsWith("{{")) result.push(getMapEntry(v.testValue));
    });
  }
};

const getPreDefinedEndpointVariables = (data?: { variables: EndpointVariableData[]; rawData: RawData }): string[] => {
  if (!data) return [];
  const result: string[] = [];
  data.variables.forEach((v) => {
    if (!v.value) getNestedPreDefinedEndpointVariables(v, result);

    if (v.value?.startsWith("{{")) result.push(getMapEntry(v.value));
    if (v.testValue?.startsWith("{{")) result.push(getMapEntry(v.testValue));
  });
  try {
    getNestedPreDefinedRawVariables(JSON.parse(data.rawData?.value ?? "{}"), result);
    getNestedPreDefinedRawVariables(JSON.parse(data.rawData?.testValue ?? "{}"), result);
  } catch (_) {}

  return result;
};

const getSwitchCase = (conditions: any[]) => {
  return {
    switch: conditions.map((c) => {
      return {
        condition: c.case,
        next: c.nextStep,
      };
    }),
  };
};

const getTemplate = (steps: Step[], node: Node, stepName: string, nextStep?: string) => {
  const data = getTemplateDataFromNode(node);
  if (node.data.stepType === StepType.UserDefined) {
    return {
      ...getDefinedEndpointStep(steps, node),
      next: nextStep ?? "formatMessages",
    };
  }

  return {
    template: `${import.meta.env.REACT_APP_PROJECT_LAYER}/${data?.templateName}`,
    requestType: "templates",
    body: data?.body,
    result: data?.resultName ?? `${stepName}_result`,
    next: nextStep ?? "formatMessages",
  };
};

const getTemplateDataFromNode = (node: Node): { templateName: string; body?: any; resultName?: string } | undefined => {
  if (node.data.stepType === StepType.Auth) {
    return {
      templateName: "tara",
      resultName: "TARA",
    };
  }
  if (node.data.stepType === StepType.Input) {
    return {
      templateName: "client-input",
      resultName: `client_input_${node.data.clientInputId}_result`,
    };
  }
  if (node.data.stepType === StepType.FileGenerate) {
    return {
      templateName: "file-generate",
      body: {
        fileName: node.data.fileName ?? "",
        fileContent: node.data.fileContent ?? "",
      },
    };
  }
  if (node.data.stepType === StepType.FileSign) {
    return {
      templateName: "siga",
      body: {
        type: "smart_id",
        country: "EE",
      },
      resultName: "SiGa",
    };
  }
  if (node.data.stepType === StepType.FinishingStepRedirect) {
    return {
      templateName: "direct-to-cs",
      body: {
        message: node.data.message ?? "",
      },
    };
  }
  if (node.data.stepType === StepType.FinishingStepEnd) {
    return {
      templateName: "end-conversation",
      body: {
        message: node.data.message ?? "",
      },
    };
  }
  if (node.data.stepType === StepType.OpenWebpage) {
    return {
      templateName: "open-webpage",
      body: {
        link: node.data.link ?? "",
        linkText: node.data.linkText ?? "",
      },
    };
  }
};

const getDefinedEndpointStep = (steps: Step[], node: Node) => {
  const name = useServiceStore.getState().name;
  const endpoint = steps.find((e) => e.label === node.data.label)?.data;
  const selectedEndpoint = endpoint?.definedEndpoints.find((e) => e.isSelected);
  if (!selectedEndpoint || !endpoint) {
    return {
      return: "",
    };
  }
  return {
    call: `${selectedEndpoint.methodType.toLowerCase() === "get" ? "http.get" : "http.post"}`,
    args: {
      url: `${import.meta.env.REACT_APP_API_URL}/services/endpoints/${name}-${
        (endpoint.name.trim().length ?? 0) > 0 ? endpoint.name.replaceAll(" ", "_") : endpoint.id
      }?type=prod`,
      body: {
        headers: `\${new Map([${getPreDefinedEndpointVariables(selectedEndpoint.headers)}])}`,
        body: `\${new Map([${getPreDefinedEndpointVariables(selectedEndpoint.body)}])}`,
        params: `\${new Map([${getPreDefinedEndpointVariables(selectedEndpoint.params)}])}`,
      },
      params: {
        type: "prod",
      },
    },
    result: (endpoint.name.trim().length ?? 0) > 0 ? `${endpoint.name.replaceAll(" ", "_")}_res` : endpoint.id,
  };
};

export const saveDraft = async () => {
  const vaildServiceInfo = useServiceStore.getState().vaildServiceInfo();
  const endpoints = useServiceStore.getState().endpoints;
  const name = useServiceStore.getState().name;
  const id = useServiceStore.getState().serviceId;

  if (!vaildServiceInfo) {
    useToastStore.getState().error({
      title: i18next.t("newService.toast.missingFields"),
      message: i18next.t("newService.toast.serviceMissingFields"),
    });
    return;
  }

  await saveEndpoints(
    endpoints,
    name,
    id,
    () => {
      useToastStore.getState().success({
        title: i18next.t("newService.toast.success"),
        message: i18next.t("newService.toast.savedSuccessfully"),
      });
    },
    (e) => {
      useToastStore.getState().error({
        title: i18next.t("newService.toast.failed"),
        message: i18next.t("newService.toast.saveFailed"),
      });
    }
  );
  return true;
};

export const saveFlowClick = async () => {
  const name = useServiceStore.getState().serviceNameDashed();
  const serviceId = useServiceStore.getState().serviceId;
  const description = useServiceStore.getState().description;
  const slot = useServiceStore.getState().slot;
  const isCommon = useServiceStore.getState().isCommon;
  const steps = useServiceStore.getState().mapEndpointsToSetps();
  const isNewService = useServiceStore.getState().isNewService;
  const edges = useServiceStore.getState().edges;
  const nodes = useServiceStore.getState().nodes;

  await saveFlow({
    steps,
    name,
    edges,
    nodes,
    onSuccess: () => {
      useToastStore.getState().success({
        title: i18next.t("newService.toast.success"),
        message: i18next.t("newService.toast.savedSuccessfully"),
      });
      useServiceStore.getState().enableTestButton();
    },
    onError: (e) => {
      useToastStore.getState().error({
        title: i18next.t("toast.cannot-save-flow"),
        message: e?.message,
      });
    },
    description,
    slot,
    isCommon,
    serviceId,
    isNewService,
  });
};

export const editServiceInfo = async () => {
  const name = useServiceStore.getState().serviceNameDashed();
  const description = useServiceStore.getState().description;
  const endpoints = useServiceStore.getState().endpoints;
  const serviceId = useServiceStore.getState().serviceId;
  const endPointsName = useServiceStore.getState().name;

  const tasks: Promise<any>[] = [];

  tasks.push(
    axios.post(editService(serviceId), {
      name,
      description,
      type: "POST",
    })
  );

  await saveEndpoints(endpoints, endPointsName, serviceId);

  await Promise.all(tasks)
    .then(() =>
      useToastStore.getState().success({
        title: i18next.t("newService.toast.success"),
        message: i18next.t("newService.toast.savedSuccessfully"),
      })
    )
    .catch((e) => {
      useToastStore.getState().error({
        title: i18next.t("newService.toast.saveFailed"),
        message: e?.message,
      });
    });
};

export const runServiceTest = async () => {
  const name = useServiceStore.getState().serviceNameDashed();
  const state = useServiceStore.getState().serviceState;

  try {
    await axios.post(testService(state, name), {});
    useToastStore.getState().success({
      title: i18next.t("newService.toast.testResultSuccess"),
    });
  } catch (error) {
    console.log("ERROR: ", error);
    useToastStore.getState().error({
      title: i18next.t("newService.toast.testResultError"),
    });
  }
};
