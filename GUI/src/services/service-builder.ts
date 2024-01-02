import axios from "axios";
import { jsonToYml } from "resources/api-constants";
import { RawData, Step, StepType } from "types";
import { EndpointData, EndpointEnv, EndpointType, EndpointVariableData } from "types/endpoint";

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
      url: `${process.env.REACT_APP_API_URL}/services/endpoints/configs/${
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
          location: `/Ruuter/POST/services/endpoints/info/${endpoint.isCommon ? "common/" : ""}${endpointName}-${
            env === EndpointEnv.Live ? "prod" : "test"
          }-info.yml`,
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
  console.log(result);
  await axios
    .post(
      jsonToYml(),
      { result },
      {
        params: {
          location: `/Ruuter/POST/services/endpoints/configs/${data.isCommon ? "common/" : ""}${endpointName}-${
            env === EndpointEnv.Live ? "prod" : "test"
          }-configs.yml`,
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

export async function saveEndpoints(endpoints: EndpointData[], serviceName: string, onSuccess: (e: any) => void, onError: (e: any) => void) {
  if (endpoints.length === 0) return;
  const setupEndpoints: EndpointData[] | undefined = endpoints;
  const elements: Step[] = [];
  setupEndpoints?.forEach((endpoint) => {
    const selectedEndpoint = endpoint.definedEndpoints.find((e) => e.isSelected);
    if (!selectedEndpoint) return;
    elements.push({
      id: elements.length,
      label:
        endpoint.name.trim().length > 0
          ? endpoint.name
          : `${selectedEndpoint.methodType.toUpperCase()} ${selectedEndpoint.url}`,
      type: StepType.UserDefined,
      data: endpoint,
    });
  });
  for (const endpoint of elements) {
    if (!endpoint?.data) continue;
    const selectedEndpointType = endpoint.data.definedEndpoints.find((e) => e.isSelected);
    if (!selectedEndpointType) continue;
    console.log("e", selectedEndpointType, endpoint);
    const endpointName = `${serviceName.replaceAll(" ", "_")}-${(endpoint.data.name.trim().length ?? 0) > 0 ? endpoint.data?.name.replaceAll(" ", "_") : endpoint.data?.id
      }`;
    for (const env of [EndpointEnv.Live, EndpointEnv.Test]) {
      await saveEndpointInfo(selectedEndpointType, env, endpointName, endpoint.data);
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
        url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${
          endpoint.data.isCommon ? "common/" : ""
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
        url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${
          endpoint.data.isCommon ? "common/" : ""
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
    console.log(jsonToYml());
    await axios
      .post(
        jsonToYml(),
        { result },
        {
          params: {
            location: `/Ruuter/${selectedEndpointType.methodType.toUpperCase()}/services/endpoints/${
              endpoint.data.isCommon ? "common/" : ""
            }${endpointName}.yml`,
          },
        }
      )
      .then(onSuccess)
      .catch(onError);
  }
}
