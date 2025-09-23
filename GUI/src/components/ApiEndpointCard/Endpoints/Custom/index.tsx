import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline } from 'react-icons/md';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { Button, FormInput, FormSelect, Icon, RequestVariables, Track } from '../../..';
import { RequestTab } from '../../../../types';
import { EndpointData, EndpointVariableData, PreDefinedEndpointEnvVariables } from '../../../../types/endpoint';
import { RequestOperator } from 'types/endpoint/request-operator';

type EndpointCustomProps = {
  endpoint: EndpointData;
  isLive: boolean;
  requestValues: PreDefinedEndpointEnvVariables;
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
};

const EndpointCustom: React.FC<EndpointCustomProps> = ({
  endpoint,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
}) => {
  const { t } = useTranslation();
  const [urlError, setUrlError] = useState<string>();
  const [key, setKey] = useState<number>(0);
  const { setEndpoints, testUrl } = useServiceStore();
  const ref = useRef<HTMLInputElement>(null);

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
      },
      headers: {
        variables: [],
        rawData: {},
      },
      params: {
        variables: [],
        rawData: {},
      },
    });
  }

  useEffect(() => setKey(key + 1), [isLive]);

  const refereshEndpoint = () => {
    setEndpoints((endpoint) => endpoint);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="endpointUrl">{t('newService.endpoint.url')}</label>
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
                };
                refereshEndpoint();
              }}
              placeholder={t('newService.endpoint.insert') ?? ''}
            />
          </Track>
          <Button
            onClick={() =>
              testUrl(
                endpoint,
                () => setUrlError(t('newService.endpoint.error') ?? undefined),
                () => {
                  setUrlError(undefined);
                  useToastStore.getState().success({
                    title: t('newService.endpoint.success'),
                  });
                },
              )
            }
          >
            {t('newService.test')}
          </Button>
        </Track>
      </div>
      {urlError && (
        <div className={'toast toast--error'} style={{ padding: '8px 16px 8px 16px' }}>
          <div className="toast__title">
            <Icon icon={<MdErrorOutline />} />
            {urlError}
          </div>
        </div>
      )}
      <RequestVariables
        key={key}
        requestValues={requestValues}
        isLive={isLive}
        endpoint={endpoint}
        requestTab={requestTab}
        setRequestTab={setRequestTab}
        parentEndpointId={endpoint.endpointId}
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
    </Track>
  );
};

function parseURL(url: string) {
  try {
    const parsedURL = new URL(url);
    const params: { [key: string]: any } = {};
    const operators: { [key: string]: string } = {};

    parsedURL.searchParams.forEach((value, key) => {
      const operatorMatch = RegExp(/(.*?)(>=|<=|>|<|=)$/).exec(key);

      if (operatorMatch) {
        const paramName = operatorMatch[1];
        const operator = operatorMatch[2];

        params[paramName] = value;
        operators[paramName] = operator;
      } else {
        params[key] = value;
        operators[key] = '=';
      }
    });

    return {
      url: parsedURL.href,
      params,
      operators,
    };
  } catch (e) {
    console.error('Invalid URL format:', e);
    return {
      url,
      params: {},
      operators: {},
    };
  }
}

export default EndpointCustom;
