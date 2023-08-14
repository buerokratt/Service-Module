import React, { useEffect, useState } from "react";
import { getOpenApiSpec } from "../../../../resources/api-constants";
import { Button, FormInput, FormSelect, RequestVariables, Track } from "../../..";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { RequestTab, Option } from "../../../../types";
import { ApiSpecProperty } from "../../../../types/api-spec-property";
import {
  EndpointData,
  EndpointType,
  EndpointVariableData,
  EndpointTab,
  PreDefinedEndpointEnvVariables,
} from "../../../../types/endpoint";
import { RequestVariablesRowData, RequestVariablesTabsRowsData } from "../../../../types/request-variables";

type EndpointOpenAPIProps = {
  endpoint: EndpointData;
  setEndpoints: React.Dispatch<React.SetStateAction<EndpointData[]>>;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
};

const EndpointOpenAPI: React.FC<EndpointOpenAPIProps> = ({
  endpoint,
  setEndpoints,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
}) => {
  const [openApiUrl, setOpenApiUrl] = useState<string>(endpoint.openApiUrl ?? "");
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType | undefined>(
    endpoint.definedEndpoints.find((e) => e.isSelected)
  );
  const [openApiEndpoints, setOpenApiEndpoints] = useState<EndpointType[]>(endpoint.definedEndpoints ?? []);
  const [key, setKey] = useState<number>(0);
  const { t } = useTranslation();

  useEffect(() => setKey(key + 1), [isLive]);

  const getEndpointSchema = (
    apiSpec: ApiSpecProperty,
    contentSchema?: ApiSpecProperty
  ): EndpointVariableData[] | undefined => {
    if (!contentSchema) return;
    if (contentSchema.items) {
      const schemaPath: string = contentSchema.items.$ref;
      return [
        {
          id: uuid(),
          name: schemaPath.split("/").pop() ?? "",
          type: "array",
          arrayType: "schema",
          required: false,
          arrayData: parseSchemaProperty(apiSpec, getPropertySchema(apiSpec, schemaPath)),
        },
      ];
    } else {
      return parseSchemaProperty(apiSpec, getPropertySchema(apiSpec, contentSchema.$ref));
    }
  };

  const getEndpointResponse = (
    apiSpec: ApiSpecProperty,
    response?: ApiSpecProperty
  ): EndpointVariableData[] | undefined => {
    if (!response) return;
    if (response.type === "object")
      return [
        {
          id: uuid(),
          name: "response",
          type: response.additionalProperties?.type,
          integerFormat: response.additionalProperties?.format,
        },
      ];
    if (response.$ref || response.type === "array") return getEndpointSchema(apiSpec, response);
    return [{ id: uuid(), name: "response", type: response.type }];
  };

  const parseSchemaProperty = (
    apiSpec: ApiSpecProperty,
    schema: ApiSpecProperty
  ): EndpointVariableData[] | undefined => {
    if (!schema.properties) return;

    const result: EndpointVariableData[] = [];
    Object.entries(schema?.properties as ApiSpecProperty).forEach(([variableName, data]: [string, ApiSpecProperty]) => {
      const variableData: EndpointVariableData = {
        id: uuid(),
        name: variableName,
        required: false,
        type: Object.keys(data).includes("$ref") ? "schema" : data.type,
      };
      variableData.description = data.description;

      if (Object.keys(data).includes("$ref")) {
        const subSchema = getPropertySchema(apiSpec, data.$ref);
        const parsedSubSchema = parseSchemaProperty(apiSpec, subSchema);
        variableData.schemaData = parsedSubSchema;
      }
      if (data.type === "array") {
        if (!Object.keys(data.items).includes("$ref")) {
          variableData.arrayType = data.items.type;
        } else {
          variableData.arrayType = "schema";
          variableData.arrayData = parseSchemaProperty(apiSpec, getPropertySchema(apiSpec, data.items.$ref));
        }
      }
      if (Object.keys(data).includes("enum")) variableData.enum = data.enum;
      if (data.type === "integer") variableData.integerFormat = data.format;

      result.push(variableData);
    });
    if (!schema.required) return result;
    Object.values(schema?.required).forEach((name) => {
      result.map((variable) => {
        if (variable.name !== name) return variable;
        variable.required = true;
        return variable;
      });
    });
    return result;
  };

  const getPropertySchema = (apiSpec: ApiSpecProperty, propertyPath: string): ApiSpecProperty => {
    const indices = propertyPath.split("/").slice(1);
    let schema = apiSpec;
    indices.forEach((indice) => (schema = schema[indice]));
    return schema;
  };

  const getParams = (params?: ApiSpecProperty[]): EndpointVariableData[] | undefined => {
    if (!params || params.length === 0) return;
    return params.map((param) => {
      return {
        id: uuid(),
        name: param.name,
        required: param.required,
        description: param.description,
        in: param.in,
        type: param.type,
        enum: param.enum,
        default: param.default,
        format: param.format,
      };
    });
  };

  const fetchOpenApiSpecMock = async () => {
    const result = await axios.post(getOpenApiSpec(), { url: openApiUrl });
    const apiSpec = result.data.response;
    const url = new URL(openApiUrl).origin + apiSpec.basePath;
    const paths: EndpointType[] = [];

    Object.entries(apiSpec.paths).forEach(([path, endpointData]) => {
      Object.entries(endpointData as ApiSpecProperty).forEach(([method, data]: [string, ApiSpecProperty]) => {
        const endpointUrl = url + path;
        const label = `${method.toUpperCase()} ${path}`;
        if (!["get", "post"].includes(method.toLowerCase())) {
          paths.push({
            id: uuid(),
            label,
            path,
            url: endpointUrl,
            type: "openApi",
            methodType: method,
            supported: false,
            isSelected: false,
          });
          return;
        }
        const body = getEndpointSchema(apiSpec, data.requestBody?.content["application/json"]?.schema);
        const params = getParams(data.parameters);
        const headers = undefined; // TODO find where to get headers
        const response = getEndpointResponse(apiSpec, data.responses["200"]);

        paths.push({
          id: uuid(),
          label,
          path,
          type: "openApi",
          methodType: method,
          supported: true,
          isSelected: false,
          description: data.summary ?? data.description,
          url: endpointUrl,
          body: body
            ? {
                variables: body,
                rawData: {},
              }
            : undefined,
          headers: headers
            ? {
                variables: headers,
                rawData: {},
              }
            : undefined,
          params: params
            ? {
                variables: params,
                rawData: {},
              }
            : undefined,
          response,
        });
      });
    });
    setOpenApiEndpoints(paths);
    setEndpoints((prevEndpoints) => {
      prevEndpoints.map((prevEndpoint) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints = paths;
        prevEndpoint.openApiUrl = openApiUrl;
        return prevEndpoint;
      });
      return prevEndpoints;
    });
    setKey(key + 1);
  };

  const checkNestedVariables = (variable: EndpointVariableData, data: RequestVariablesRowData[]) => {
    const variableData = variable.type === "schema" ? variable.schemaData : variable.arrayData;
    if (variableData instanceof Array) {
      (variableData as EndpointVariableData[]).forEach((variableData) => {
        const updatedVariable = data.find((updated) => updated.endpointVariableId === variableData.id);
        variableData[isLive ? "value" : "testValue"] = updatedVariable?.value;
        if (["schema", "array"].includes(variableData.type)) {
          checkNestedVariables(variableData, data);
        }
      });
    }
  };

  const updateEndpointData = (data: RequestVariablesTabsRowsData, openApiEndpointId?: string) => {
    if (!openApiEndpointId) return;
    setEndpoints((prevEndpoints) => {
      return prevEndpoints.map((prevEndpoint) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((openApiEndpoint) => {
          if (openApiEndpoint.id !== openApiEndpointId) return openApiEndpoint;
          Object.keys(data).forEach((key) => {
            openApiEndpoint[key as EndpointTab]?.variables.forEach((variable) => {
              if (["schema", "array"].includes(variable.type)) {
                checkNestedVariables(variable, data[key as EndpointTab]!);
              }
              const updatedVariable = data[key as EndpointTab]!.find(
                (updated) => updated.endpointVariableId === variable.id
              );
              variable[isLive ? "value" : "testValue"] = updatedVariable?.value;
            });
          });
          return openApiEndpoint;
        });
        return prevEndpoint;
      });
    });
    setKey(key + 1);
  };

  const onSelectEndpoint = (selection: Option | null) => {
    const newSelectedEndpoint = openApiEndpoints.find((openApiEndpoint) => openApiEndpoint.label === selection?.label);
    setSelectedEndpoint(newSelectedEndpoint);
    setEndpoints((prevEndpoints) => {
      return prevEndpoints.map((prevEndpoint) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((definedEndpoint) => {
          definedEndpoint.isSelected = definedEndpoint === newSelectedEndpoint;
          return definedEndpoint;
        });
        return prevEndpoint;
      });
    });
    setKey(key + 1);
  };

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="endpointUrl">{t("newService.endpoint.url")}</label>
        <Track gap={8}>
          <FormInput
            name="endpointUrl"
            label=""
            placeholder={t("newService.endpoint.insert") ?? ""}
            value={openApiUrl}
            onChange={(e) => setOpenApiUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              fetchOpenApiSpecMock();
            }}
          >
            {t("newService.endpoint.ask")}
          </Button>
        </Track>
      </div>
      {openApiEndpoints.length > 0 && (
        <div>
          <label htmlFor="select-endpoint">{t("newService.endpoint.single")}</label>
          <FormSelect
            name={"select-endpoint"}
            label={""}
            defaultValue={selectedEndpoint?.label}
            options={openApiEndpoints.map((openApiEndpoint) => {
              return { label: openApiEndpoint.label, value: openApiEndpoint.label };
            })}
            onSelectionChange={onSelectEndpoint}
          />
        </div>
      )}
      {selectedEndpoint &&
        (selectedEndpoint?.supported ? (
          <>
            <p>{selectedEndpoint?.description}</p>
            <RequestVariables
              key={key}
              disableRawData
              isLive={isLive}
              endpointData={selectedEndpoint}
              updateEndpointData={updateEndpointData}
              requestValues={requestValues}
              requestTab={requestTab}
              setRequestTab={setRequestTab}
              setEndpoints={setEndpoints}
            />
          </>
        ) : (
          <p>{t("newService.endpoint.unsupported")}</p>
        ))}
    </Track>
  );
};

export default EndpointOpenAPI;
