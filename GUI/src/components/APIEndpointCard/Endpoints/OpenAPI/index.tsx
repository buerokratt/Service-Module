import React, { useEffect, useState } from "react";
import { openApiSpeckMock } from "../../../../resources/api-constants";
import { Button, FormInput, FormSelect, Track } from "../../..";
import { useTranslation } from "react-i18next";
import RequestVariables from "../RequestVariables";
import axios from "axios";
import { EndpointType } from "../../../../types/endpoint-type";
import { EndpointRequestData } from "../../../../types/endpoint-request-data";
import { ApiSpecProperty } from "../../../../types/api-spec-property";
import { v4 as uuid } from "uuid";
import { EndpointTab } from "../../../../types/endpoint-tab.enum";
import { RequestVariablesTabsRowsData } from "../../../../types/request-variables-tabs-rows-data";
import { EndpointData } from "../../../../types/endpoint-data";

type EndpointOpenAPIProps = {
  endpoint: EndpointData;
  setEndpoints: React.Dispatch<React.SetStateAction<EndpointData[]>>;
  isLive: boolean;
};

const EndpointOpenAPI: React.FC<EndpointOpenAPIProps> = ({ endpoint, setEndpoints, isLive }) => {
  const [openApiUrl, setOpenApiUrl] = useState<string>(endpoint.url ?? "");
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointType | undefined>(
    endpoint.definedEndpoints.find((e) => e.isSelected)
  );
  const [openApiEndpoints, setOpenApiEndpoints] = useState<EndpointType[]>(endpoint.definedEndpoints ?? []);
  const [key, setKey] = useState<number>(0);
  const { t } = useTranslation();

  useEffect(() => setKey(key + 1), [isLive]);

  const getEndpointBody = (
    apiSpec: ApiSpecProperty,
    contentSchema?: ApiSpecProperty
  ): EndpointRequestData[] | undefined => {
    if (!contentSchema) return;
    if (contentSchema.items) {
      const schemaPath: string = contentSchema.items.$ref;
      return [
        {
          name: schemaPath.split("/").pop() ?? "",
          type: "array",
          required: false,
          arrayData: parseBodyProperty(apiSpec, getPropertySchema(apiSpec, schemaPath)),
        },
      ];
    } else {
      return parseBodyProperty(apiSpec, getPropertySchema(apiSpec, contentSchema.$ref));
    }
  };

  const parseBodyProperty = (apiSpec: ApiSpecProperty, schema: ApiSpecProperty): EndpointRequestData[] | undefined => {
    if (!schema.properties) return;

    const result: EndpointRequestData[] = [];
    Object.entries(schema?.properties as ApiSpecProperty).forEach(([variableName, data]: [string, ApiSpecProperty]) => {
      const variableData: EndpointRequestData = {
        name: variableName,
        required: false,
        type: Object.keys(data).includes("$ref") ? "schema" : data.type,
      };
      variableData.description = data.description;

      if (Object.keys(data).includes("$ref")) {
        const subSchema = getPropertySchema(apiSpec, data.$ref);
        const parsedSubSchema = parseBodyProperty(apiSpec, subSchema);
        variableData.schemaData = parsedSubSchema;
      }
      if (data.type === "array") {
        if (!Object.keys(data.items).includes("$ref")) {
          variableData.arrayData = data.items.type;
        } else {
          variableData.arrayData = parseBodyProperty(apiSpec, getPropertySchema(apiSpec, data.items.$ref));
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

  const getParams = (params?: ApiSpecProperty[]): EndpointRequestData[] | undefined => {
    if (!params) return;
    return params.map((param) => {
      return {
        name: param.name,
        required: param.required,
        description: param.description,
        in: param.in,
        type: param.schema.type,
        enum: param.schema.enum,
        default: param.schema.default,
        integerFormat: param.schema.integerFormat,
      };
    });
  };

  const fetchOpenApiSpecMock = async () => {
    // const result = await axios.post(openApiSpeckMock());
    // const apiSpec = result.data.response;
    const result = await axios.get(openApiSpeckMock());
    const apiSpec = result.data;
    const url = new URL(openApiUrl).origin + apiSpec.servers[0].url;
    console.log(apiSpec);
    const paths: EndpointType[] = [];

    Object.entries(apiSpec.paths).forEach(([path, endpointData]) => {
      Object.entries(endpointData as ApiSpecProperty).forEach(([method, data]: [string, ApiSpecProperty]) => {
        const label = `${method.toUpperCase()} ${path}`;
        if (!["get", "post"].includes(method.toLowerCase())) {
          paths.push({
            id: uuid(),
            label,
            path: path,
            methodType: method,
            supported: false,
            isSelected: false,
          });
          return;
        }
        const body = getEndpointBody(apiSpec, data.requestBody?.content["application/json"]?.schema);
        const params = getParams(data.parameters);
        const headers = undefined; // TODO find where to get headers

        paths.push({
          id: uuid(),
          label,
          path: path,
          methodType: method,
          supported: true,
          isSelected: false,
          description: data.summary ?? data.description,
          body: body,
          headers: headers,
          params: params,
        });
      });
    });

    setOpenApiEndpoints(paths);
    setEndpoints((prevEndpoints: any) => {
      prevEndpoints.map((prevEndpoint: any) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints = paths;
        prevEndpoint.url = url;
        return prevEndpoint;
      });
      return prevEndpoints;
    });
    setKey(key + 1);
  };

  const updateEndpointData = (data: RequestVariablesTabsRowsData, openApiEndpointId?: string) => {
    if (!openApiEndpointId) return;
    setEndpoints((prevEndpoints) => {
      return prevEndpoints.map((prevEndpoint) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((openApiEndpoint) => {
          if (openApiEndpoint.id !== openApiEndpointId) return openApiEndpoint;
          Object.keys(data).forEach((key) => {
            openApiEndpoint[key as EndpointTab]?.forEach((variable) => {
              const updatedVariable = data[key as EndpointTab]!.find(
                (updatedVariable) => updatedVariable.variable === variable.name
              );
              variable[isLive ? "value" : "testValue"] = updatedVariable?.value;
            });
          });
          return openApiEndpoint;
        });
        return prevEndpoint;
      });
    });
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
            onSelectionChange={(selection) => {
              const newSelectedEndpoint = openApiEndpoints.find(
                (openApiEndpoint) => openApiEndpoint.label === selection?.label
              );
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
            }}
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
            />
          </>
        ) : (
          <p>Sorry, we currently only support GET and POST requests.</p>
        ))}
    </Track>
  );
};

export default EndpointOpenAPI;
