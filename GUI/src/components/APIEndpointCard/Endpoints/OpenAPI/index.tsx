import React, { useState } from "react";
import { openApiSpeckMock } from "../../../../resources/api-constants";
import { Button, FormInput, FormSelect, Track } from "../../..";
import { Option } from "../../../../types/option";
import { useTranslation } from "react-i18next";
import RequestVariables from "../RequestVariables";
import axios from "axios";
import { EndpointType } from "../../../../types/endpoint-type";
import { EndpointRequestData } from "../../../../types/endpoint-request-data";
import { ApiSpecProperty } from "../../../../types/api-spec-property";


const EndpointOpenAPI: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Option | null>();
  const [endpoints, setEndpoints] = useState<EndpointType[]>([]);
  const [key, setKey] = useState<number>(0);
  const { t } = useTranslation();

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
          arrayData: parseBodyProperty(
            apiSpec,
            getPropertySchema(apiSpec, schemaPath)
          ),
        },
      ];
    } else {
      return parseBodyProperty(
        apiSpec,
        getPropertySchema(apiSpec, contentSchema.$ref)
      );
    }
  };

  const parseBodyProperty = (
    apiSpec: ApiSpecProperty,
    schema: ApiSpecProperty
  ): EndpointRequestData[] | undefined => {
    if (!schema.properties) return;

    const result: EndpointRequestData[] = [];
    Object.entries(schema?.properties as ApiSpecProperty).forEach(
      ([variableName, data]: [string, ApiSpecProperty]) => {
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
            const parsedSubSchema = parseBodyProperty(
              apiSpec,
              getPropertySchema(apiSpec, data.items.$ref)
            );
            variableData.arrayData = parsedSubSchema;
          }
        }
        if (Object.keys(data).includes("enum")) variableData.enum = data.enum;
        if (data.type === "integer") variableData.integerFormat = data.format;

        result.push(variableData);
      }
    );
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

  const getPropertySchema = (
    apiSpec: ApiSpecProperty,
    propertyPath: string
  ): ApiSpecProperty => {
    const indices = propertyPath.split("/").slice(1);
    let schema = apiSpec;
    indices.forEach((indice) => (schema = schema[indice]));
    return schema;
  };

  const getParams = (
    params?: ApiSpecProperty[]
  ): EndpointRequestData[] | undefined => {
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
    const result = await axios.post(openApiSpeckMock());
    const apiSpec = result.data.response;
    const paths: EndpointType[] = [];

    Object.entries(apiSpec.paths).forEach(([endpointName, endpointData]) => {
      Object.entries(endpointData as ApiSpecProperty).forEach(
        ([method, data]: [string, ApiSpecProperty]) => {
          const path = `${method.toUpperCase()} ${endpointName}`;
          if (!["get", "post"].includes(method.toLowerCase())) {
            paths.push({
              label: path,
              value: path,
              url: endpointName,
              methodType: method,
              supported: false,
            });
            return;
          }
          const body = getEndpointBody(
            apiSpec,
            data.requestBody?.content["application/json"]?.schema
          );
          const params = getParams(data.parameters);
          const headers = undefined; // TODO find where to get headers

          paths.push({
            label: path,
            value: path,
            url: endpointName,
            methodType: method,
            supported: true,
            description: data.summary ?? data.description,
            body: body,
            headers: headers,
            params: params,
          });
        }
      );
    });

    setEndpoints(paths);
    setKey(key + 1);
  };

  const isEndpointSupported = (): boolean => {
    return getSelectedEndpointData()?.supported ?? false;
  };

  const getSelectedEndpointData = (): EndpointType | undefined => {
    return endpoints.find(
      (endpoint) => endpoint.value === selectedEndpoint?.value
    );
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
            onChange={(v) => console.log(endpoints)}
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
      {endpoints.length > 0 && (
        <div>
          <label htmlFor="select-endpoint">
            {t("newService.endpoint.single")}
          </label>
          <FormSelect
            name={"select-endpoint"}
            label={""}
            options={endpoints}
            onSelectionChange={(value) => {
              setSelectedEndpoint(value);
              setKey(key + 1);
            }}
          />
        </div>
      )}
      {selectedEndpoint &&
        (isEndpointSupported() ? (
          <>
            <p>{getSelectedEndpointData()?.description}</p>
            <RequestVariables
              key={key}
              disableRawData
              endpointData={getSelectedEndpointData()}
            />
          </>
        ) : (
          <p>Sorry, we currently only support GET and POST requests.</p>
        ))}
    </Track>
  );
};

export default EndpointOpenAPI;
