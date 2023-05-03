import { CSSProperties, FC, useEffect, useState } from "react";
import { MarkerType, Node, ReactFlowInstance, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
import { Box, Collapsible, NewServiceHeader, Track, FlowElementsPopup } from "../components";
import { useTranslation } from "react-i18next";
import FlowBuilder, { GRID_UNIT } from "../components/FlowBuilder/FlowBuilder";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import apiIconTag from "../assets/images/api-icon-tag.svg";
import "reactflow/dist/style.css";
import "./ServiceFlowPage.scss";
import { StepType, Step, RawData } from "../types";
import { EndpointData, EndpointEnv, EndpointType, EndpointVariableData } from "../types/endpoint";
import axios from "axios";
import { jsonToYml } from "../resources/api-constants";

const initialPlaceholder = {
  id: "2",
  type: "placeholder",
  position: {
    x: 3 * GRID_UNIT,
    y: 8 * GRID_UNIT,
  },
  data: {
    type: "placeholder",
  },
  className: "placeholder",
  selectable: false,
  draggable: false,
};

const initialEdge = {
  type: "smoothstep",
  id: "edge-1-2",
  source: "1",
  target: "2",
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

// TODO: refactoring
type NodeDataProps = {
  label: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  type: string;
  stepType: StepType;
  readonly: boolean;
  message?: string;
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "startNode",
    position: {
      x: 13.5 * GRID_UNIT,
      y: GRID_UNIT,
    },
    data: {},
    className: "start",
    selectable: false,
    draggable: false,
  },
  initialPlaceholder,
];

const ServiceFlowPage: FC = () => {
  const { t } = useTranslation();
  const allElements: Step[] = [
    { id: 1, label: t("serviceFlow.element.taraAuthentication"), type: StepType.Auth },
    { id: 2, label: t("serviceFlow.element.textfield"), type: StepType.Textfield },
    { id: 3, label: t("serviceFlow.element.clientInput"), type: StepType.Input },
    { id: 4, label: t("serviceFlow.element.openNewWebpage"), type: StepType.OpenWebpage },
    { id: 5, label: t("serviceFlow.element.fileGeneration"), type: StepType.FileGenerate },
    { id: 6, label: t("serviceFlow.element.fileSigning"), type: StepType.FileSign },
    { id: 7, label: t("serviceFlow.element.siga"), type: StepType.SiGa },
    { id: 8, label: t("serviceFlow.element.conversationEnd"), type: StepType.FinishingStepEnd },
    {
      id: 9,
      label: t("serviceFlow.element.redirectConversationToSupport"),
      type: StepType.FinishingStepRedirect,
    },
  ];
  const [setupElements, setSetupElements] = useState<Step[]>([]);
  const location = useLocation();
  const [updatedRules, setUpdatedRules] = useState<(string | null)[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeDataProps> | null>(null);
  const navigate = useNavigate();
  const serviceName = location.state?.serviceName;
  const serviceDescription = location.state?.serviceDescription;
  const flow = location.state?.flow ? JSON.parse(location.state?.flow) : undefined;
  const [nodes, setNodes, onNodesChange] = useNodesState(flow ? flow.nodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow ? flow.edges : [initialEdge]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

  const getTemplateDataFromNode = (
    node: Node
  ): { templateName: string; body?: any; resultName?: string } | undefined => {
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
        resultName: `ClientInput.${node.data.clientInputId}`,
      };
    }
    if (node.data.stepType === StepType.SiGa) {
      return {
        templateName: "siga",
        body: {
          type: ``,
          personIdentifier: ``,
          country: ``,
          phoneNumber: ``,
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

  const getPreDefinedEndpointVariables = (data?: {
    variables: EndpointVariableData[];
    rawData: RawData;
  }): { [key: string]: string } => {
    if (!data) return {};
    const result: { [key: string]: string } = {};
    data.variables.forEach((v) => {
      // TODO missing quotes may fail
      if (v.value && v.value.startsWith("{{"))
        result[v.value.replace("{{", "").replace("}}", "")] = v.value.replace("{{", "${").replace("}}", "}");
      if (v.testValue && v.testValue.startsWith("{{"))
        result[`${v.testValue.replace("{{", "").replace("}}", "")}`] = v.testValue
          .replace("{{", "${")
          .replace("}}", "}");
    });
    return result;
  };

  const getDefinedEndpointStep = (node: Node) => {
    const endpoint = setupElements.find((e) => e.label === node.data.label)?.data;
    const selectedEndpoint = endpoint?.definedEndpoints.find((e) => e.isSelected);
    if (!selectedEndpoint || !endpoint) return {};
    return {
      call: `http.post`,
      args: {
        url: `http://ruuter:8085/services/endpoints/${selectedEndpoint.methodType.toLowerCase()}-myService-${
          (endpoint.name.trim().length ?? 0) > 0 ? endpoint.name : endpoint.id
        }`,
        body: {
          headers: getPreDefinedEndpointVariables(selectedEndpoint.headers),
          body: getPreDefinedEndpointVariables(selectedEndpoint.body),
          params: getPreDefinedEndpointVariables(selectedEndpoint.params),
        },
        params: {
          type: "prod",
        },
      },
      result: (endpoint.name.trim().length ?? 0) > 0 ? endpoint.name : endpoint.id,
    };
  };

  const getTemplate = (node: Node, stepName: string, nextStep?: string) => {
    const data = getTemplateDataFromNode(node);
    if (node.data.stepType === StepType.UserDefined) {
      return {
        ...getDefinedEndpointStep(node),
        next: nextStep ?? "service-end",
      };
    }
    return {
      template: data?.templateName ? `sticky/${data?.templateName}` : "templateName",
      requestType: "post",
      body: data?.body,
      result: data?.resultName ?? `${stepName}_result`,
      next: nextStep ?? "service-end",
    };
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

  const assignNestedRawVariables = (
    data: { [key: string]: any },
    key: string,
    path: string,
    result: { [key: string]: string }
  ) => {
    Object.keys(data).forEach((k) => {
      if (typeof data[k] === "object") {
        return assignNestedRawVariables(data[k], key, `${path}__${k}`, result);
      }
      result[`${path}__${k}`] = data[k];
    });
  };

  const assignRawVariables = (data: { [key: string]: any }, key: string) => {
    const result: any = {};
    Object.keys(data).forEach((k) => {
      if (typeof data[k] === "object") {
        return assignNestedRawVariables(data[k], key, k, result);
      }
      result[k] = data[k];
    });
    return result;
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
      return assignRawVariables(JSON.parse(rawData), key);
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

  // Since we currently cannot mark variables as sensitive from GUI, we set all as sensitive
  const saveEndpointInfo = async (selectedEndpoint: EndpointType, env: EndpointEnv, endpointName: string) => {
    await saveEndpointConfig(selectedEndpoint, env, endpointName);

    const steps = new Map();
    // todo, pass headers, body, params to config
    steps.set("get-configs", {
      call: "http.post",
      args: {
        url: `http://ruuter:8085/services/endpoints/configs/${endpointName}-${
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

  const getNestedVariables = (
    variable: EndpointVariableData,
    key: string,
    path: string,
    result: { [key: string]: any }
  ) => {
    const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
    if (variableData instanceof Array) {
      (variableData as EndpointVariableData[]).forEach((v) => {
        if (["schema", "array"].includes(v.type)) {
          const nestedResult = {};
          getNestedVariables(v, key, `${path}.${v.name}`, nestedResult);
          result[v.name] = nestedResult;
          return;
        }
        result[v.name] = `\${info.response.body.${key}["${path}.${v.name}"]}`;
      });
    }
  };

  const getNestedRawData = (
    data: { [key: string]: any },
    key: string,
    path: string,
    result: { [key: string]: any }
  ) => {
    Object.keys(data).forEach((k) => {
      if (typeof data[k] === "object") {
        result[k] = {};
        return getNestedRawData(data[k], key, `${path}.${k}`, result[k]);
      }
      result[k] = `\${info.response.body.${key}["${path}.${k}"]}`;
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
      // TODO missing quotes may fail
      if (["schema", "array"].includes(v.type)) {
        if (v.type === "array" && v.arrayType !== "schema") {
          result[v.name] = `\${[info.response.body.${key}["${v.name}"]]}`;
          return;
        }
        const nestedResult = {};
        getNestedVariables(v, key, v.name, nestedResult);
        result[v.name] = nestedResult;
        return;
      }
      result[v.name] = `\${info.response.body.${key}["${v.name}"]}`;
    });
    if (Object.keys(result).length === 0) {
      try {
        [data.rawData.value, data.rawData.testValue].forEach((rawData) => {
          if (!rawData) return;
          const parsedData = JSON.parse(rawData);
          Object.keys(parsedData).forEach((k) => {
            if (typeof parsedData[k] === "object") {
              result[k] = {};
              return getNestedRawData(parsedData[k], key, k, result[k]);
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

  const saveEndpoints = async () => {
    for (const endpoint of setupElements) {
      if (!endpoint?.data) continue;
      const selectedEndpointType = endpoint.data.definedEndpoints.find((e) => e.isSelected);
      if (!selectedEndpointType) continue;
      console.log("e", selectedEndpointType, endpoint);
      const endpointName = `${selectedEndpointType.methodType.toLowerCase()}-myService-${
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
          url: `http://ruuter:8085/services/endpoints/info/${endpointName}-prod-info`,
          body: {
            params: "${incoming.body.params ?? new Map()}",
            headers: "${incoming.body.headers ?? new Map()}",
            body: "${incoming.body.body ?? new Map()}",
          },
        },
        result: "info",
        next: "test_endpoint",
      });
      steps.set("get_test_info", {
        call: "http.post",
        args: {
          url: `http://ruuter:8085/services/endpoints/info/${endpointName}-test-info`,
          body: {
            params: "${incoming.body.params ?? new Map()}",
            headers: "${incoming.body.headers ?? new Map()}",
            body: "${incoming.body.body ?? new Map()}",
          },
        },
        result: "info",
        next: "test_endpoint",
      });
      steps.set("test_endpoint", {
        return: "${info.response.body}",
        next: "end",
      });
      steps.set("execute_endpoint", {
        call: selectedEndpointType.type.toLowerCase() === "get" ? "http.get" : "http.post",
        args: {
          url: selectedEndpointType.url,
          headers: {
            ...getEndpointVariables("headers", selectedEndpointType.headers),
          },
          body: {
            ...getEndpointVariables("body", selectedEndpointType.body),
          },
          params: {
            ...getEndpointVariables("params", selectedEndpointType.params),
          },
        },
        result: "res",
        next: "return_result",
      });
      steps.set("return_result", {
        return: "${res.response.body}",
        next: "end",
      });
      steps.set("return_no_type_error", {
        status: "400",
        return: "Please Specify Endpoint Type 'prod' Or 'test'",
        next: "end",
      });
      const result = Object.fromEntries(steps.entries());
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

  const saveFlow = async () => {
    console.log(nodes);
    console.log(edges);
    await saveEndpoints();
    const allRelations: any[] = [];
    // find regular edges 1 -> 1
    edges.forEach((edge) => {
      const node = nodes.find((node) => node.id === edge.source);
      const followingNode = nodes.find((node) => node.id === edge.target);
      if (!node) return;
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
        const clientInput = `ClientInput.${parentNode.data.clientInputId}`;
        const clientInputName = `${clientInput}-step`;
        finishedFlow.set(parentStepName, getTemplate(parentNode, clientInputName, `${clientInput}-switch`));
        finishedFlow.set(
          `${clientInput}-switch`,
          getSwitchCase(
            edges
              .filter((e) => e.source === parentNodeId)
              .map((e) => {
                const node = nodes.find((node) => node.id === e.target);
                if (!node) return e.target;
                const matchingRule = parentNode.data?.rules?.find(
                  (_: never, i: number) => `rule ${i}` === node.data.label
                );
                const followingNode = nodes.find((n) => n.id === edges.find((edge) => edge.source === node.id)?.target);
                return {
                  case: matchingRule
                    ? `\${${matchingRule.name.replace("{{", "").replace("}}", "")} ${matchingRule.condition} ${
                        matchingRule.value
                      }}`
                    : `\${${clientInput} == ${node.data.label === "rule 0" ? '"Yes"' : '"No"'}}`,
                  nextStep: followingNode
                    ? `${followingNode.data.stepType}-${followingNode.id}`
                    : `${node.data.stepType}-${e.target}`,
                };
              })
          )
        );
        return;
      }
      return finishedFlow.set(
        parentStepName,
        getTemplate(parentNode, parentStepName, childNode ? `${childNode.data.stepType}-${childNodeId}` : childNodeId)
      );
    });
    finishedFlow.set("service-end", {
      wrapper: false,
      return: "",
    });
    console.log(finishedFlow);
    const result = Object.fromEntries(finishedFlow.entries());
    await axios
      .post(
        jsonToYml(),
        { result },
        {
          params: {
            location: "/Ruuter/POST/services/tests.yml",
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

  useEffect(() => {
    const setupEndpoints: EndpointData[] | undefined = location.state?.endpoints;
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
    setSetupElements(elements);
  }, []);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, step: Step) => {
    event.dataTransfer.setData("application/reactflow-label", step.label);
    event.dataTransfer.setData("application/reactflow-type", step.type);
    event.dataTransfer.effectAllowed = "move";
  };

  const contentStyle: CSSProperties = { overflowY: "auto", maxHeight: "40vh" };

  const handlePopupClose = () => resetStates();

  const handlePopupSave = (updatedNode: Node<NodeDataProps>) => {
    resetStates();
    if (selectedNode?.data.stepType === StepType.FinishingStepEnd) return;

    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.id !== selectedNode!.id) return prevNode;
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            message: updatedNode.data.message,
          },
        };
      })
    );
  };

  const resetStates = () => {
    setSelectedNode(null);
  };

  return (
    <>
      <NewServiceHeader
        activeStep={3}
        saveDraftOnClick={saveFlow}
        endpoints={location.state?.endpoints}
        flow={JSON.stringify(reactFlowInstance?.toObject())}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        continueOnClick={() => navigate(ROUTES.OVERVIEW_ROUTE)}
      />
      <h1 style={{ padding: 16 }}>Teenusvoog "{serviceName}"</h1>
      <FlowElementsPopup
        onClose={() => handlePopupClose()}
        onSave={(updatedNode: Node) => {
          handlePopupSave(updatedNode);
        }}
        onRulesUpdate={(rules) => {
          if (selectedNode?.data.stepType === StepType.Input) setUpdatedRules(rules);
          resetStates();
        }}
        node={selectedNode}
        oldRules={updatedRules}
      />
      <ReactFlowProvider>
        <div className="graph">
          <div className="graph__controls">
            <Track direction="vertical" gap={16} align="stretch">
              {setupElements && (
                <Collapsible title={t("serviceFlow.setupElements")} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {setupElements.map((step) => (
                      <Box
                        key={step.id}
                        color={
                          [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type)
                            ? "red"
                            : "blue"
                        }
                        onDragStart={(event) => onDragStart(event, step)}
                        draggable
                      >
                        <Track gap={8} style={{ overflow: "hidden" }}>
                          {step.type === "user-defined" && <img alt="" src={apiIconTag} />}
                          {step.label}
                        </Track>
                      </Box>
                    ))}
                  </Track>
                </Collapsible>
              )}
              {allElements && (
                <Collapsible title={t("serviceFlow.allElements")} contentStyle={contentStyle}>
                  <Track direction="vertical" align="stretch" gap={4}>
                    {allElements.map((step) => (
                      <Box
                        key={step.id}
                        color={
                          [StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type)
                            ? "red"
                            : "blue"
                        }
                        onDragStart={(event) => onDragStart(event, step)}
                        draggable
                      >
                        {step.label}
                      </Box>
                    ))}
                  </Track>
                </Collapsible>
              )}
            </Track>
          </div>
          <FlowBuilder
            reactFlowInstance={reactFlowInstance}
            setReactFlowInstance={setReactFlowInstance}
            onNodeEdit={setSelectedNode}
            updatedRules={updatedRules}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
          />
        </div>
      </ReactFlowProvider>
    </>
  );
};

export default ServiceFlowPage;
