import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from 'services/api';
import { extractMapValues, getEndpointBody } from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { Button, FormInput, FormSelect, RequestVariables, Track } from '../../..';
import { getOpenApiSpec } from '../../../../resources/api-constants';
import { Option, RequestTab } from '../../../../types';
import { ApiSpecProperty } from '../../../../types/api-spec-property';
import {
  EndpointData,
  EndpointDefinition,
  EndpointVariableData,
  PreDefinedEndpointEnvVariables,
} from '../../../../types/endpoint';
import { generateJsonRequest } from '../../../../utils/json-request-utils';
import { useTheme } from '../../../../utils/useTheme';
import { TestPayload } from '../Custom';

type EndpointOpenAPIProps = {
  endpoint: EndpointData;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
  onTestSuccess?: (payload: TestPayload) => void;
  onDescriptionChange?: (description: string) => void;
  onMandatoryViolationChange?: (hasViolation: boolean) => void;
};

const EndpointOpenAPI: React.FC<EndpointOpenAPIProps> = ({
  endpoint,
  // This needs to be removed in the future
  // This is always true as we have removed the Test tab
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
  onTestSuccess,
  onDescriptionChange,
  onMandatoryViolationChange,
}) => {
  const [openApiUrl, setOpenApiUrl] = useState<string>(endpoint?.definitions[0]?.openApiUrl ?? '');
  const [description, setDescription] = useState<string>(() => {
    const initial = endpoint.description ?? '';
    if (initial) onDescriptionChange?.(initial);
    return initial;
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDefinition | undefined>(
    endpoint.definitions.find((e) => e.isSelected),
  );
  const [openApiEndpoints, setOpenApiEndpoints] = useState<EndpointDefinition[]>(endpoint.definitions ?? []);
  const [key, setKey] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [responseContent, setResponseContent] = useState<string | null>(endpoint.responseSchema ?? null);
  const [isResponseOpen, setIsResponseOpen] = useState(!!endpoint.responseSchema);
  const { t } = useTranslation();
  const theme = useTheme();

  // Adding "key" dependency breaks focus in variable inputs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setKey((prevKey) => prevKey + 1), [isLive]);

  const handleTestClick = () => {
    if (!selectedEndpoint) return;
    setIsTesting(true);
    const request = {
      url: selectedEndpoint.url,
      method: selectedEndpoint.methodType ?? 'GET',
      headers: extractMapValues(selectedEndpoint.headers) as Record<string, string>,
      params: extractMapValues(selectedEndpoint.params) as Record<string, string>,
      body: getEndpointBody(selectedEndpoint),
    };
    generateJsonRequest(selectedEndpoint)
      .then((content) => {
        const schema = JSON.stringify(content, undefined, 4);
        setResponseContent(schema);
        endpoint.responseSchema = schema;
        setIsResponseOpen(true);
        useToastStore.getState().success({ title: t('newService.endpoint.success') });
        onTestSuccess?.({ request, responseBody: content });
      })
      .catch((error) => {
        useToastStore.getState().error({ title: (error as Error).message ?? t('newService.endpoint.error') });
      })
      .finally(() => setIsTesting(false));
  };

  const getEndpointSchema = (
    apiSpec: ApiSpecProperty,
    contentSchema?: ApiSpecProperty,
  ): EndpointVariableData[] | undefined => {
    if (!contentSchema) return;
    if (contentSchema.items) {
      const schemaPath: string = contentSchema.items.$ref;
      return [
        {
          id: uuid(),
          name: schemaPath.split('/').pop() ?? '',
          type: 'array',
          arrayType: 'schema',
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
    response?: ApiSpecProperty,
  ): EndpointVariableData[] | undefined => {
    if (!response) return;
    if (response.type === 'object')
      return [
        {
          id: uuid(),
          name: 'response',
          type: response.additionalProperties?.type,
          integerFormat: response.additionalProperties?.format,
        },
      ];
    if (response.$ref || response.type === 'array') return getEndpointSchema(apiSpec, response);
    return [{ id: uuid(), name: 'response', type: response.type }];
  };

  const parseSchemaProperty = (
    apiSpec: ApiSpecProperty,
    schema: ApiSpecProperty,
  ): EndpointVariableData[] | undefined => {
    if (!schema.properties) return;

    const result: EndpointVariableData[] = [];
    Object.entries(schema?.properties as ApiSpecProperty).forEach(([variableName, data]: [string, ApiSpecProperty]) => {
      const variableData: EndpointVariableData = {
        id: uuid(),
        name: variableName,
        required: false,
        type: Object.keys(data).includes('$ref') ? 'schema' : data.type,
      };
      variableData.description = data.description;

      if (Object.keys(data).includes('$ref')) {
        const subSchema = getPropertySchema(apiSpec, data.$ref);
        const parsedSubSchema = parseSchemaProperty(apiSpec, subSchema);
        variableData.schemaData = parsedSubSchema;
      }
      if (data.type === 'array') {
        if (Object.keys(data.items).includes('$ref')) {
          variableData.arrayType = 'schema';
          variableData.arrayData = parseSchemaProperty(apiSpec, getPropertySchema(apiSpec, data.items.$ref));
        } else {
          variableData.arrayType = data.items.type;
        }
      }
      if (Object.keys(data).includes('enum')) variableData.enum = data.enum;
      if (data.type === 'integer') variableData.integerFormat = data.format;

      result.push(variableData);
    });
    if (!schema.required) return result;
    // The types are ambiguous here
    // Required can a record of strings (here) or a boolean (in getParams)
    // This might be a bug, impossible to resolve without refactoring this old component
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.values(schema?.required).forEach((name) => {
      result.forEach((variable) => {
        if (variable.name !== name) return;
        variable.required = true;
      });
    });
    return result;
  };

  const getPropertySchema = (apiSpec: ApiSpecProperty, propertyPath: string): ApiSpecProperty => {
    const indices = propertyPath.split('/').slice(1);
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
        type: param.type ?? param.schema?.type,
        enum: param.enum,
        default: param.default,
        format: param.format,
      };
    });
  };

  const fetchOpenApiSpecMock = async () => {
    let result;
    try {
      result = await api.post<{ response: ApiSpecProperty }>(getOpenApiSpec(), { url: openApiUrl });
    } catch {
      useToastStore.getState().error({ title: t('newService.endpoint.error') });
      return;
    }
    const apiSpec = result.data.response;
    if (!apiSpec?.paths) {
      useToastStore.getState().error({ title: t('newService.endpoint.error') });
      return;
    }
    const url = new URL(openApiUrl).origin + (apiSpec.basePath ?? '');
    const paths: EndpointDefinition[] = [];

    Object.entries(apiSpec.paths).forEach(([path, endpointData]) => {
      Object.entries(endpointData).forEach(([method, data]) => {
        const endpointUrl = url + path;
        const label = `${method.toUpperCase()} ${path}`;
        if (!['get', 'post'].includes(method.toLowerCase())) {
          paths.push({
            id: uuid(),
            label,
            path,
            url: endpointUrl,
            openApiUrl,
            type: 'openApi',
            methodType: method,
            supported: true,
            isSelected: true,
            dataType: 'custom',
          });
          return;
        }
        const body = getEndpointSchema(apiSpec, data.requestBody?.content['application/json']?.schema);
        const params = getParams(data.parameters);
        const headers = undefined; // where to get headers ?
        const response = getEndpointResponse(apiSpec, data.responses['200']);

        paths.push({
          id: uuid(),
          label,
          path,
          type: 'openApi',
          methodType: method,
          supported: true,
          isSelected: true,
          description: data.summary ?? data.description,
          url: endpointUrl,
          openApiUrl,
          dataType: 'custom',
          body: body
            ? {
                variables: body,
                rawData: {},
                isRawSelected: false,
              }
            : undefined,
          headers: headers
            ? {
                variables: headers,
                rawData: {},
                isRawSelected: false,
              }
            : undefined,
          params: params
            ? {
                variables: params,
                rawData: {},
                isRawSelected: false,
              }
            : undefined,
          response,
        });
      });
    });
    setOpenApiEndpoints(paths);
    endpoint.definitions = paths;
    if (paths.length > 0) endpoint.definitions[0].openApiUrl = openApiUrl;
    setKey(key + 1);
    useToastStore.getState().success({ title: t('newService.endpoint.fetchEndpointsSuccess') });
  };

  const onSelectEndpoint = (selection: Option | null) => {
    const newSelectedEndpoint = openApiEndpoints.find((ep) => ep.label === selection?.label);
    setSelectedEndpoint(newSelectedEndpoint);
    if (!newSelectedEndpoint) return;
    endpoint.definitions = [];
    endpoint.definitions.push(newSelectedEndpoint);
    setKey((k) => k + 1);
  };

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      {/* Description */}
      <div>
        <label htmlFor="endpointDescription" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
          {t('newService.description')}
        </label>
        <FormInput
          name="endpointDescription"
          label=""
          placeholder={t('newService.endpoint.insertDescription') ?? ''}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            endpoint.description = e.target.value;
            onDescriptionChange?.(e.target.value);
          }}
        />
      </div>

      {/* Open API URL + Ask for endpoints */}
      <div>
        <label htmlFor="endpointUrl" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
          {t('newService.endpoint.url')}
        </label>
        <Track gap={8}>
          <FormInput
            name="endpointUrl"
            label=""
            placeholder={t('newService.endpoint.insert') ?? ''}
            value={openApiUrl}
            onChange={(e) => setOpenApiUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              void fetchOpenApiSpecMock();
            }}
          >
            {t('newService.endpoint.ask')}
          </Button>
        </Track>
      </div>

      {/* Endpoints dropdown — always visible */}
      <div>
        <label htmlFor="select-endpoint" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
          {t('newService.endpoint.endpoints')}
        </label>
        <FormSelect
          name="select-endpoint"
          label=""
          style={{ fontSize: '15px' }}
          defaultValue={selectedEndpoint?.label}
          options={openApiEndpoints.map((ep) => ({ label: ep.label, value: ep.label }))}
          onSelectionChange={onSelectEndpoint}
        />
      </div>

      {/* Params / Header / Body + Test URL + Response */}
      {selectedEndpoint &&
        (selectedEndpoint.supported ? (
          <>
            {selectedEndpoint.description && (
              <p style={{ margin: 0, fontSize: 13, color: theme === 'dark' ? '#ccc' : '#666' }}>
                {selectedEndpoint.description}
              </p>
            )}
            <RequestVariables
              key={key}
              disableRawData
              isLive={isLive}
              endpoint={endpoint}
              requestValues={requestValues}
              requestTab={requestTab}
              setRequestTab={setRequestTab}
              onParametersChange={() => {}}
              onMandatoryViolationChange={onMandatoryViolationChange}
            />
            <Track justify="end">
              <Button appearance={isTesting ? 'loading' : 'primary'} onClick={handleTestClick}>
                {t('newService.test')}
              </Button>
            </Track>
            <div>
              <button
                type="button"
                onClick={() => setIsResponseOpen((o) => !o)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid #D2D3D8',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  color: theme === 'dark' ? 'white' : '#34394C',
                }}
              >
                <span>{t('newService.endpoint.response')}</span>
                <span>{isResponseOpen ? '▲' : '▼'}</span>
              </button>
              {isResponseOpen && (
                <textarea
                  readOnly
                  value={responseContent ?? ''}
                  placeholder="{...}"
                  style={{
                    width: '100%',
                    minHeight: 100,
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    padding: '8px',
                    border: '1px solid #D2D3D8',
                    borderRadius: 4,
                    backgroundColor: '#F0F0F2',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <p>{t('newService.endpoint.unsupported')}</p>
        ))}
    </Track>
  );
};

export default EndpointOpenAPI;
