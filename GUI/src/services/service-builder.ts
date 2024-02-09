import axios from "axios";
import i18next from 'i18next';
import { Edge, Node } from "reactflow";
import { createNewService, editService, updateServiceEndpoints, jsonToYml, testDraftService } from "resources/api-constants";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";
import { RawData, Step, StepType } from "types";
import { EndpointData, EndpointEnv, EndpointType, EndpointVariableData } from "types/endpoint";

//
// TODO: refactor this file
//

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
    (variableData as EndpointVariableData[]).forEach((v) => {
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
  endpoint: EndpointData,
) => {
  await saveEndpointConfig(selectedEndpoint, env, endpointName, endpoint);

  const steps = new Map();
  steps.set("get-configs", {
    call: "http.post",
    args: {
      url: `${process.env.REACT_APP_API_URL}/services/endpoints/configs/${endpoint.isCommon ? "common/" : ""
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
          location: `/Ruuter/POST/services/endpoints/info/${endpoint.isCommon ? "common/" : ""}${endpointName}-${env === EndpointEnv.Live ? "prod" : "test"
            }-info.yml`,
        },
      }
    )
    .then(console.log)
    .catch(console.log)
};

const saveEndpointConfig = async (
  endpoint: EndpointType,
  env: EndpointEnv,
  endpointName: string,
  data: EndpointData,
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
  steps.set("combine_step", {
    assign: {
      sensitive: `\${new Map([${typeof headers === "string"
        ? `["headers", headers]`
        : `["headers", new Map([${Object.keys(headers ?? {}).map(
          (h) => `["${h.replaceAll("__", ".")}", headers_${h}]`
        )}])]`
        }, ${typeof body === "string"
          ? `["body", body]`
          : `["body", new Map([${Object.keys(body ?? {}).map((b) => `["${b.replaceAll("__", ".")}", body_${b}]`)}])]`
        }, ${typeof params === "string"
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
          location: `/Ruuter/POST/services/endpoints/configs/${data.isCommon ? "common/" : ""}${endpointName}-${env === EndpointEnv.Live ? "prod" : "test"
            }-configs.yml`,
        },
      }
    )
    .then(console.log)
    .catch(console.log)
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
const assignValues = (
  data: string | { [key: string]: string },
  key: string,
  variables: { [key: string]: string }
) => {
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
    (variableData as EndpointVariableData[]).forEach((v) => {
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
  onSuccess: (e: any) => void,
  onError: (e: any) => void,
  id: string,
) {
  const tasks: Promise<any>[] = [];
  const serviceEndpoints = endpoints.filter(e => e.serviceId === id || !e.hasOwnProperty('serviceId')).map(x => x);

  for (const endpoint of serviceEndpoints) {
    if (!endpoint) continue;
    endpoint.serviceId = id
    const selectedEndpointType = endpoint.definedEndpoints.find((e) => e.isSelected);
    if (!selectedEndpointType) continue;

    const endpointName = `${name.replaceAll(" ", "_")}-${(endpoint.name.trim().length ?? 0) > 0 ? endpoint?.name.replaceAll(" ", "_") : endpoint?.id
      }`;
    for (const env of [EndpointEnv.Live, EndpointEnv.Test]) {
      await saveEndpointInfo(selectedEndpointType, env, endpointName, endpoint);
    }
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
        url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${endpoint.isCommon ? "common/" : ""
          }${endpointName}-prod-info`,
        body: {
          params: "${incoming.body.params ?? new Map()}",
          headers: "${incoming.body.headers ?? new Map()}",
          body: "${incoming.body.body ?? new Map()}",
        },
      },
      result: "info",
      next: "assign_endpoint_url",
    });
    steps.set("get_test_info", {
      call: `http.post`,
      args: {
        url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${endpoint.isCommon ? "common/" : ""
          }${endpointName}-test-info`,
        body: {
          params: "${incoming.body.params ?? new Map()}",
          headers: "${incoming.body.headers ?? new Map()}",
          body: "${incoming.body.body ?? new Map()}",
        },
      },
      result: "info",
      next: "assign_endpoint_url",
    });
    const endpointParams = getEndpointVariables("params", selectedEndpointType.params);
    const endpointHeaders = getEndpointVariables("headers", selectedEndpointType.headers);
    const endpointBody = getEndpointVariables("body", selectedEndpointType.body);
    let endpointUrl = selectedEndpointType.url;
    if (endpointUrl?.includes("{")) {
      const variable = selectedEndpointType.url?.slice(
        selectedEndpointType.url?.indexOf("{") + 1,
        selectedEndpointType.url.indexOf("}")
      );
      endpointUrl = selectedEndpointType.url?.replace(`{${variable}}` ?? "", endpointParams[variable ?? ""]);
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
        headers: Object.keys(endpointHeaders).length > 0 ? endpointHeaders : undefined,
        body: Object.keys(endpointBody).length > 0 ? endpointBody : undefined,
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
    const result = Object.fromEntries(steps.entries());

    tasks.push(axios.post(
        jsonToYml(),
        { result },
        {
          params: {
            location: `/Ruuter/${selectedEndpointType.methodType.toUpperCase()}/services/endpoints/${endpoint.isCommon ? "common/" : ""
              }${endpointName}.yml`,
          },
        }
    ));
  }

  tasks.push(axios.post(updateServiceEndpoints(id), {
      endpoints: JSON.stringify(serviceEndpoints),
  }));

  await Promise.all(tasks).then(onSuccess).catch(onError);
}

export const saveFlow = async (
  steps: Step[],
  name: string,
  edges: Edge[],
  nodes: Node[],
  onSuccess: (e: any) => void,
  onError: (e: any) => void,
  description: string,
  isCommon: boolean,
  serviceId: string,
  isNewService: boolean,
) => {
  try {
    const allRelations: any[] = [];
    // find regular edges 1 -> 1
    edges.forEach((edge) => {
      const node = nodes.find((node) => node.id === edge.source);
      const followingNode = nodes.find((node) => node.id === edge.target);
      if (!node) return;
      if (node.data.stepType === StepType.Textfield && node.data.message === undefined) {
        throw new Error(i18next.t("toast.missing-textfield-message") ?? "Error");
      }
      if (
        node.data.stepType === StepType.OpenWebpage &&
        (node.data.link === undefined || node.data.linkText === undefined)
      ) {
        throw new Error(i18next.t("toast.missing-website") ?? "Error");
      }

      if (
        node.data.stepType === StepType.FileGenerate &&
        (node.data.fileName === undefined || node.data.fileContent === undefined)
      ) {
        throw new Error(i18next.t("toast.missing-file-generation") ?? "Error");
      }

      if (node.data.stepType === StepType.Input || followingNode?.type === "placeholder") {
        if (!allRelations.includes(node.id)) allRelations.push(node.id);
        return;
      }
      allRelations.push(`${edge.source}-${edge.target}`);
    });
    // find finishing nodes
    edges.forEach((edge) => {
      const current = edges.find((lastEdge) => lastEdge.source === edge.source);
      const nextStep = edges.find((lastEdge) => lastEdge.source === edge.target);
      if (!nextStep && current?.type !== "placeholder") allRelations.push(edge.target);
    });

    const finishedFlow = new Map();
    finishedFlow.set("get_secrets", {
      call: "http.get",
      args: {
        url: `${process.env.REACT_APP_API_URL}/secrets-with-priority`,
      },
      result: "secrets",
    });
    allRelations.forEach((r) => {
      const [parentNodeId, childNodeId] = r.split("-");
      const parentNode = nodes.find((node) => node.id === parentNodeId);
      if (
        !parentNode ||
        parentNode.type !== "customNode" ||
        [StepType.Rule, StepType.RuleDefinition].includes(parentNode.data.stepType)
      )
        return;

      const childNode = nodes.find((node) => node.id === childNodeId);
      const parentStepName = `${parentNode.data.stepType}-${parentNodeId}`;
      if (parentNode.data.stepType === StepType.Input) {
        if (parentNode.data.rules === undefined) {
          throw new Error(i18next.t("toast.missing-client_input-rules") ?? "Error");
        }

        const clientInput = `ClientInput_${parentNode.data.clientInputId}`;
        const clientInputName = `${clientInput}-step`;
        finishedFlow.set(parentStepName, getTemplate(steps, parentNode, clientInputName, `${clientInput}-assign`));
        finishedFlow.set(`${clientInput}-assign`, {
          assign: {
            [clientInput]: `\${${clientInput}_result.input}`,
          },
          next: `${clientInput}-switch`,
        });

        finishedFlow.set(
          `${clientInput}-switch`,
          getSwitchCase(
            edges
              .filter((e) => e.source === parentNodeId)
              .map((e) => {
                const node = nodes.find((node) => node.id === e.target);
                if (!node) return e.target;
                const matchingRule = parentNode.data?.rules?.find(
                  (_: never, i: number) => `rule ${i + 1}` === node.data.label
                );
                const followingNode = nodes.find(
                  (n) => n.id === edges.find((edge) => edge.source === node.id)?.target
                );
                return {
                  case:
                    matchingRule && !["Yes", "No"].includes(matchingRule?.condition)
                      ? `\${${matchingRule.name.replace("{{", "").replace("}}", "")} ${matchingRule.condition} ${matchingRule.value
                      }}`
                      : `\${${clientInput} == ${node.data.label === "rule 1" ? '"Yes"' : '"No"'}}`,
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
        getTemplate(steps, parentNode, parentStepName, childNode ? `${childNode.data.stepType}-${childNodeId}` : childNodeId)
      );
    });
    finishedFlow.set("service-end", {
      wrapper: false,
      return: "",
    });

    const result = Object.fromEntries(finishedFlow.entries());

    await axios
      .post(
        isNewService ? createNewService() : editService(serviceId) ,
        {
          name,
          serviceId,
          description,
          type: "POST",
          content: result,
          isCommon,
          structure: JSON.stringify({ edges, nodes }),
        },
        {
          params: {
            location: "/Ruuter/POST/services/tests.yml",
          },
        }
      )
      .then(onSuccess)
      .catch(onError);


    const endpoints = steps.filter(x => !!x.data).map(x => x.data!);
    await saveEndpoints(endpoints, name, onSuccess, onError, serviceId);
  } catch (e: any) {
    onError(e);
    useToastStore.getState().error({
      title: i18next.t("toast.cannot-save-flow"),
      message: e?.message,
    });
  }
};

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
    (variableData as EndpointVariableData[]).forEach((v) => {
      if (["schema", "array"].includes(v.type)) getNestedPreDefinedEndpointVariables(v, result);

      if (v.value && v.value.startsWith("{{")) result.push(getMapEntry(v.value));
      if (v.testValue && v.testValue.startsWith("{{")) result.push(getMapEntry(v.testValue));
    });
  }
};

const getPreDefinedEndpointVariables = (data?: { variables: EndpointVariableData[]; rawData: RawData }): string[] => {
  if (!data) return [];
  const result: string[] = [];
  data.variables.forEach((v) => {
    if (!v.value) getNestedPreDefinedEndpointVariables(v, result);

    if (v.value && v.value.startsWith("{{")) result.push(getMapEntry(v.value));
    if (v.testValue && v.testValue.startsWith("{{")) result.push(getMapEntry(v.testValue));
  });
  try {
    getNestedPreDefinedRawVariables(JSON.parse(data.rawData?.value ?? "{}"), result);
    getNestedPreDefinedRawVariables(JSON.parse(data.rawData?.testValue ?? "{}"), result);
  } catch (_) { }

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
      next: nextStep ?? "service-end",
    };
  }
  return {
    template: `templates/${data?.templateName}`,
    requestType: "post",
    body: data?.body,
    result: data?.resultName ?? `${stepName}_result`,
    next: nextStep ?? "service-end",
  };
};

const getTemplateDataFromNode = (node: Node): { templateName: string; body?: any; resultName?: string } | undefined => {
  if (node.data.stepType === StepType.Auth) {
    return {
      templateName: "tara",
      resultName: "TARA",
    };
  }
  if (node.data.stepType === StepType.Textfield) {
    return {
      templateName: "send-message-to-client",
      body: {
        message: `${node.data.message?.replace("{{", "${").replace("}}", "}")}`,
      },
    };
  }
  if (node.data.stepType === StepType.Input) {
    return {
      templateName: "client-input",
      resultName: `ClientInput_${node.data.clientInputId}_result`,
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
  const endpoint = steps.find((e) => e.label === node.data.label)?.data;
  const selectedEndpoint = endpoint?.definedEndpoints.find((e) => e.isSelected);
  if (!selectedEndpoint || !endpoint) {
    return {
      return: "",
    };
  }
  return {
    call: `http.post`,
    args: {
      url: `${process.env.REACT_APP_API_URL
        }/services/endpoints/${selectedEndpoint.methodType.toLowerCase()}-${name}-${(endpoint.name.trim().length ?? 0) > 0 ? endpoint.name : endpoint.id
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
    result: (endpoint.name.trim().length ?? 0) > 0 ? endpoint.name : endpoint.id,
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
    },
    id,
  );
  return true;
};

export const saveFlowClick = async (onSuccess: () => void) => {
  const name = useServiceStore.getState().serviceNameDashed();
  const serviceId = useServiceStore.getState().serviceId;
  const description = useServiceStore.getState().description;
  const isCommon = useServiceStore.getState().isCommon;
  const steps = useServiceStore.getState().mapEndpointsToSetps();
  const isNewService = useServiceStore.getState().isNewService;
  const edges = useServiceStore.getState().edges;
  const nodes = useServiceStore.getState().nodes;

  await saveFlow(steps, name, edges, nodes,
    () => {
      onSuccess();
      useToastStore.getState().success({
        title: i18next.t("newService.toast.success"),
        message: i18next.t("newService.toast.savedSuccessfully"),
      });
    },
    (e) => {
      useToastStore.getState().error({
        title: i18next.t("toast.cannot-save-flow"),
        message: e?.message,
      });
    }, description, isCommon, serviceId, isNewService);
}

export const runServiceTest = async () => {
  const name = useServiceStore.getState().serviceNameDashed();

  try {
    await axios.post(testDraftService(name), {});
    useToastStore.getState().success({
      title: "Test result- success",
    });
  } catch (error) {
    console.log("ERROR: ", error);
    useToastStore.getState().error({
      title: "Test result - error",
    });
  }
};

export const editServiceInfo = async () => {
  const name = useServiceStore.getState().serviceNameDashed();
  const description = useServiceStore.getState().description;
  const endpoints = useServiceStore.getState().endpoints;
  const serviceId = useServiceStore.getState().serviceId;
  const endPointsName = useServiceStore.getState().name;

  const tasks: Promise<any>[] = [];

  tasks.push(axios.post(editService(serviceId), {
      name,
      description,
      type: "POST",
    }
  ));

   await saveEndpoints(endpoints, endPointsName, () => {}, (_) => {}, serviceId);

  await Promise.all(tasks)
  .then(() => useToastStore.getState().success({
    title: i18next.t("newService.toast.success"),
    message: i18next.t("newService.toast.savedSuccessfully"),
  }))
  .catch((e) => {
    useToastStore.getState().error({
      title: i18next.t("newService.toast.saveFailed"),
      message: e?.message,
    });
  });
}
