import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, FormInput, ApiEndpointCard, FormTextarea, Layout, NewServiceHeader, Track } from "../components";
import { v4 as uuid } from "uuid";
import { ROUTES } from "../resources/routes-constants";
import { Node } from "reactflow";
import axios from "axios";
import { getSecretVariables, getTaraAuthResponseVariables, jsonToYml } from "../resources/api-constants";
import { EndpointData, EndpointEnv, EndpointType, EndpointVariableData, PreDefinedEndpointEnvVariables } from "../types/endpoint";
import { ToastContext } from "../components/Toast/ToastContext";
import { Step } from "types/step";
import { StepType } from "types/step-type.enum";
import { RawData } from "types";

const NewServicePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState<EndpointData[]>(location.state?.endpoints ?? []);
  const { intentName } = useParams();
  const [serviceName, setServiceName] = useState<string>(location.state?.serviceName ?? intentName ?? "");
  const [description, setDescription] = useState<string>(location.state?.serviceDescription ?? "");
  const [secrets, setSecrets] = useState<PreDefinedEndpointEnvVariables>(location.state?.secrets ?? {});
  const onDelete = (id: string) => {
    setEndpoints((prevEndpoints) => prevEndpoints.filter((prevEndpoint) => prevEndpoint.id !== id));
  };
  const [availableVariables, setAvailableVariables] = useState<PreDefinedEndpointEnvVariables>({ prod: [], test: [] });
  const toast = useContext(ToastContext);

  useEffect(() => {
    const nodes: Node[] | undefined = location.state?.flow ? JSON.parse(location.state?.flow)?.nodes : undefined;
    const variables: string[] = [];
    nodes
      ?.filter((node) => node.data.stepType === "input")
      .forEach((node) => variables.push(`{{ClientInput_${node.data.clientInputId}}}`));
    loadSecretVariables();
    if (nodes?.find((node) => node.data.stepType === "auth")) loadTaraVariables();
    setAvailableVariables((prevVariables) => {
      variables.forEach((v) => {
        if (!prevVariables.prod.includes(v)) prevVariables.prod.push(v);
      });
      return prevVariables;
    });
  }, []);

  const loadSecretVariables = () => {
    axios.get(getSecretVariables()).then((result) => {
      const data: { prod: string[]; test: string[] } = result.data;
      data.prod = data.prod.map((v) => `{{${v}}}`);
      data.test = data.test.map((v) => `{{${v}}}`);
      if (!data) return;
      if (Object.keys(secrets).length === 0) setSecrets(data);

      setAvailableVariables((prevVariables) => {
        data.prod.forEach((v) => {
          if (!prevVariables.prod.includes(v)) prevVariables.prod.push(v);
        });
        data.test.forEach((v) => {
          if (!data.prod.includes(v) && !prevVariables.test.includes(v)) prevVariables.test.push(v);
        });
        return prevVariables;
      });
    });
  };

  const loadTaraVariables = () => {
    axios.post(getTaraAuthResponseVariables()).then((result) => {
      const data: { [key: string]: any } = result.data?.response?.body ?? {};
      const taraVariables: string[] = [];
      Object.keys(data).forEach((key) => taraVariables.push(`{{TARA.${key}}}`));
      setAvailableVariables((oldVaraibles) => {
        taraVariables.forEach((tv) => {
          if (!oldVaraibles.prod.includes(tv)) oldVaraibles.prod.push(tv);
        });
        return oldVaraibles;
      });
    });
  };

  const saveEndpoints = async () => {
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
      const endpointName = `${selectedEndpointType.methodType.toLowerCase()}-${serviceName}-${
        (endpoint.data.name.trim().length ?? 0) > 0 ? endpoint.data?.name : endpoint.data?.id
      }`;
      for (const env of [EndpointEnv.Live, EndpointEnv.Test]) {
        await saveEndpointInfo(selectedEndpointType, env, endpointName);
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
          url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${endpointName}-prod-info`,
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
          url: `${process.env.REACT_APP_API_URL}/services/endpoints/info/${endpointName}-test-info`,
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
       console.log("hi");
       console.log(jsonToYml());
      await axios
        .post(
          jsonToYml(),
          { result },
          {
            params: {
              location: `/Ruuter/POST/services/endpoints/${endpointName}.yml`,
            },
          }
        )
        .then((r) => {
          console.log(r);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // Since we currently cannot mark variables as sensitive from GUI, we set all as sensitive
  const saveEndpointInfo = async (selectedEndpoint: EndpointType, env: EndpointEnv, endpointName: string) => {
    await saveEndpointConfig(selectedEndpoint, env, endpointName);

    const steps = new Map();
    steps.set("get-configs", {
      call: "http.post",
      args: {
        url: `${process.env.REACT_APP_API_URL}/services/endpoints/configs/${endpointName}-${
          env === EndpointEnv.Live ? "prod" : "test"
        }-configs`,
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
            location: `/Ruuter/POST/services/endpoints/info/${endpointName}-${
              env === EndpointEnv.Live ? "prod" : "test"
            }-info.yml`,
          },
        }
      )
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.log(e);
      });
  };

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

  const saveEndpointConfig = async (endpoint: EndpointType, env: EndpointEnv, endpointName: string) => {
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
        sensitive: `\${new Map([${
          typeof headers === "string"
            ? `["headers", headers]`
            : `["headers", new Map([${Object.keys(headers ?? {}).map(
                (h) => `["${h.replaceAll("__", ".")}", headers_${h}]`
              )}])]`
        }, ${
          typeof body === "string"
            ? `["body", body]`
            : `["body", new Map([${Object.keys(body ?? {}).map((b) => `["${b.replaceAll("__", ".")}", body_${b}]`)}])]`
        }, ${
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
    console.log(result)
    await axios
      .post(
        jsonToYml(),
        { result },
        {
          params: {
            location: `/Ruuter/POST/services/endpoints/configs/${endpointName}-${
              env === EndpointEnv.Live ? "prod" : "test"
            }-configs.yml`,
          },
        }
      )
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.log(e);
      });
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

  const saveDraft = async () => {
    if (serviceName && description) {
      await saveEndpoints();
    } else {
      toast.open({
        type: "error",
        title: t("newService.toast.missingFields"),
        message: t("newService.toast.serviceMissingFields"),
      });
    }
  };

  const getSelectedEndpoints = () => {
    return endpoints.map((endpoint) => {
      return {
        ...endpoint,
        selectedEndpoint: endpoint.definedEndpoints.find((definedEndpoint) => definedEndpoint.isSelected),
      };
    });
  };

  const getAvailableRequestValues = (endpointId: string): PreDefinedEndpointEnvVariables => {
    const otherEndpoints = getSelectedEndpoints().filter((otherEndpoint) => otherEndpoint.id !== endpointId);
    otherEndpoints.forEach((endpoint) => {
      endpoint.selectedEndpoint?.response?.forEach((response) => {
        const variable = `{{${endpoint.name === "" ? endpoint.id : endpoint.name}.${response.name}}}`;
        if (!availableVariables.prod.includes(variable)) availableVariables.prod.push(variable);
      });
    });
    return availableVariables;
  };

  const onNameChange = (endpointId: string, oldName: string, newName: string) => {
    availableVariables.prod = availableVariables.prod.filter((v) => v.replace("{{", "").split(".")[0] !== oldName);
    const endpoint = getSelectedEndpoints().find((otherEndpoint) => otherEndpoint.id === endpointId);
    endpoint?.selectedEndpoint?.response?.forEach((response) => {
      const variable = `{{${newName === "" ? endpoint.id : newName}.${response.name}}}`;
      if (!availableVariables.prod.includes(variable)) availableVariables.prod.push(variable);
    });
  };

  return (
    <Layout
      disableMenu
      customHeader={
        <NewServiceHeader
          activeStep={2}
          availableVariables={availableVariables}
          saveDraftOnClick={saveDraft}
          isSaveButtonEnabled={endpoints.length > 0}
          endpoints={endpoints}
          flow={location.state?.flow}
          secrets={secrets}
          serviceDescription={description}
          serviceName={serviceName}
          continueOnClick={() => {
            if (serviceName && description) {
              navigate(ROUTES.FLOW_ROUTE, {
                state: {
                  endpoints,
                  secrets,
                  serviceName,
                  availableVariables: availableVariables,
                  flow: location.state?.flow,
                  serviceDescription: description,
                },
              });
            } else {
              toast.open({
                type: "error",
                title: t("newService.toast.missingFields"),
                message: t("newService.toast.serviceMissingFields"),
              });
            }
          }}
        />
      }
    >
      <Track style={{ width: 800, alignSelf: "center" }} direction="vertical" gap={16} align="stretch">
        <h1>{t("newService.serviceSetup")}</h1>
        <Card>
          <Track direction="vertical" align="stretch" gap={16}>
            <div>
              <label htmlFor="name">{t("newService.name")}</label>
              <FormInput name="name" label="" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="description">{t("newService.description")}</label>
              <FormTextarea
                name="description"
                label=""
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  height: 120,
                  resize: "vertical",
                }}
              />
            </div>
          </Track>
        </Card>

        {endpoints.map((endpoint) => (
          <ApiEndpointCard
            key={endpoint.id}
            onDelete={() => onDelete(endpoint.id)}
            endpoint={endpoint}
            setEndpoints={setEndpoints}
            requestValues={getAvailableRequestValues(endpoint.id)}
            onNameChange={onNameChange}
          />
        ))}
        <Button
          appearance="text"
          onClick={() =>
            setEndpoints((endpoints) => {
              return [...endpoints, { id: uuid(), name: "", definedEndpoints: [] }];
            })
          }
        >
          {t("newService.endpoint.add")}
        </Button>
      </Track>
    </Layout>
  );
};

export default NewServicePage;
