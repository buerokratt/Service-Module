import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore, { extractMapValues, getEndpointBody } from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { RequestOperator } from 'types/endpoint/request-operator';
import { generateJsonRequest } from 'utils/json-request-utils';
import { v4 as uuid } from 'uuid';

import { Button, FormInput, FormSelect, RequestVariables, Track } from '../../..';
import { RequestTab } from '../../../../types';
import { EndpointData, EndpointVariableData, PreDefinedEndpointEnvVariables } from '../../../../types/endpoint';
import { useTheme } from '../../../../utils/useTheme';

export type TestPayload = {
  request: {
    url: string | undefined;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body: unknown;
  };
  responseBody: unknown;
};

type EndpointCustomProps = {
  endpoint: EndpointData;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
  onTestSuccess?: (payload: TestPayload) => void;
  onDescriptionChange?: (description: string) => void;
  onMandatoryViolationChange?: (hasViolation: boolean) => void;
};

const EndpointCustom: React.FC<EndpointCustomProps> = ({
  endpoint,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
  onTestSuccess,
  onDescriptionChange,
  onMandatoryViolationChange,
}) => {
  const { t } = useTranslation();
  const [key, setKey] = useState<number>(0);
  const { setEndpoints } = useServiceStore();
  const ref = useRef<HTMLInputElement>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [description, setDescription] = useState<string>(endpoint.description ?? '');
  const initialDescriptionRef = useRef(endpoint.description ?? '');
  const onDescriptionChangeRef = useRef(onDescriptionChange);
  const [responseContent, setResponseContent] = useState<string | null>(null);
  const [isResponseOpen, setIsResponseOpen] = useState(false);

  useEffect(() => {
    if (initialDescriptionRef.current) {
      onDescriptionChangeRef.current?.(initialDescriptionRef.current);
    }
  }, []);

  // initial endpoint data
  if (endpoint.definitions.length === 0) {
    endpoint.definitions.push({
      id: uuid(),
      label: '',
      methodType: 'GET',
      type: 'custom',
      dataType: 'custom',
      path: '',
      supported: true,
      isSelected: true,
      body: {
        variables: [],
        rawData: {},
        isRawSelected: false,
      },
      headers: {
        variables: [],
        rawData: {},
        isRawSelected: false,
      },
      params: {
        variables: [],
        rawData: {},
        isRawSelected: false,
      },
    });
  }

  // Adding "key" dependency breaks focus in variable inputs
  // Likely impossible to fix without a significant refactor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setKey(key + 1), [isLive]);
  const theme = useTheme();

  const handleJsonRequestClick = () => {
    setIsTesting(true);
    const def = endpoint.definitions[0];
    const request = {
      url: def.url,
      method: def.methodType,
      headers: extractMapValues(def.headers) as Record<string, string>,
      params: extractMapValues(def.params) as Record<string, string>,
      body: getEndpointBody(def),
    };
    generateJsonRequest(def)
      .then((content) => {
        setResponseContent(JSON.stringify(content, undefined, 4));
        setIsResponseOpen(true);
        useToastStore.getState().success({ title: t('newService.endpoint.success') });
        onTestSuccess?.({ request, responseBody: content });
      })
      .catch((error) => {
        useToastStore.getState().error({ title: error.message ?? t('newService.endpoint.error') });
      })
      .finally(() => setIsTesting(false));
  };

  const refereshEndpoint = () => {
    setEndpoints((endpoint) => endpoint);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="endpointDescription" style={{ color: `${theme === 'dark' ? 'white' : 'black'}` }}>
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
      <div>
        <label htmlFor="endpointUrl" style={{ color: `${theme === 'dark' ? 'white' : 'black'}` }}>
          {t('newService.endpoint.url')}
        </label>
        <Track gap={8}>
          <Track style={{ width: '100%' }}>
            <div style={{ width: 108 }}>
              <FormSelect
                name={'request-type'}
                label={''}
                style={{ borderRadius: '4px 0 0 4px', borderRight: 0, fontSize: '15px' }}
                options={[
                  { label: 'GET', value: 'GET' },
                  { label: 'POST', value: 'POST' },
                ]}
                onSelectionChange={(selection) => {
                  endpoint.definitions[0].methodType = selection?.value ?? 'GET';
                }}
                defaultValue={endpoint.definitions[0]?.methodType ?? 'GET'}
              />
            </div>
            <FormInput
              ref={ref}
              style={{ borderRadius: '0 4px 4px 0' }}
              name="endpointUrl"
              label=""
              defaultValue={endpoint.definitions[0]?.url ?? ''}
              onChange={(event) => {
                const parsedUrl = parseURL(event.target.value);
                endpoint.definitions[0].url = parsedUrl.url;

                const parameters: EndpointVariableData[] = [];
                Object.keys(parsedUrl.params).forEach((key) => {
                  parameters.push({
                    id: uuid(),
                    name: key,
                    type: 'custom',
                    required: false,
                    value: parsedUrl.params[key],
                    operator: (parsedUrl.operators[key] as RequestOperator) || '=',
                  });
                });

                endpoint.definitions[0].params = {
                  variables: parameters,
                  rawData: {},
                  isRawSelected: false,
                };
                refereshEndpoint();
              }}
              placeholder={t('newService.endpoint.insert') ?? ''}
            />
          </Track>
        </Track>
      </div>
      <RequestVariables
        key={key}
        requestValues={requestValues}
        isLive={isLive}
        endpoint={endpoint}
        requestTab={requestTab}
        setRequestTab={setRequestTab}
        onMandatoryViolationChange={onMandatoryViolationChange}
        onParametersChange={(parameters) => {
          const url = new URL(endpoint.definitions[0].url ?? '');
          const baseUrl = `${url.origin}${url.pathname}`;

          const queryString = parameters
            .filter((param) => param.value && param.name)
            .map((param) => {
              const operator = param.operator ? param.operator : '=';
              return `${param.name}${operator}${encodeURIComponent(param.value ?? '')}`;
            })
            .join('&');

          endpoint.definitions[0].url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
          endpoint.definitions[0].params = {
            variables: parameters,
            rawData: {},
          };

          if (ref?.current) {
            ref.current.value = endpoint.definitions[0].url;
          }
        }}
      />
      <Track justify="end">
        <Button appearance={isTesting ? 'loading' : 'primary'} onClick={handleJsonRequestClick}>
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
    </Track>
  );
};

function parseURL(url: string) {
  try {
    const queryString = url.split('?')[1] ?? '';
    const params: Record<string, any> = {};
    const operators: Record<string, string> = {};

    queryString
      .split('&')
      .filter(Boolean)
      .forEach((segment) => {
        const { index, token } = findOperators(segment);
        const name = decodeURIComponent(index === -1 ? segment : segment.slice(0, index));
        const value = decodeURIComponent(index === -1 ? '' : segment.slice(index + token.length));
        const operator = index === -1 ? '=' : token;
        if (name) {
          params[name] = value;
          operators[name] = operator;
        }
      });

    return { url, params, operators };
  } catch (e) {
    console.error('Invalid URL format:', e);
    return { url, params: {}, operators: {} };
  }
}

function findOperators(segment: string): { index: number; token: string } {
  const operatorTokens = ['>=', '<=', '>', '<', '='];
  let found = operatorTokens
    .map((token) => ({ token, idx: segment.indexOf(token) }))
    .filter(({ idx }) => idx !== -1)
    .sort((a, b) => a.idx - b.idx || b.token.length - a.token.length)[0];
  return found ? { index: found.idx, token: found.token } : { index: -1, token: '' };
}

export default EndpointCustom;
