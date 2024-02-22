import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { Button, FormInput, FormSelect, Icon, RequestVariables, Track } from "../../..";
import { getEndpointValidation } from "../../../../resources/api-constants";
import { RequestTab } from "../../../../types";
import { EndpointData, EndpointVariableData, PreDefinedEndpointEnvVariables } from "../../../../types/endpoint";
import useServiceStore from "store/new-services.store";
import useToastStore from "store/toasts.store";

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
  const { setEndpoints } = useServiceStore();
  const ref = useRef<HTMLInputElement>(null);

  // initial endpoint data
  if (endpoint.definedEndpoints.length === 0) {
    endpoint.definedEndpoints.push({
      id: uuid(),
      label: "",
      methodType: "GET",
      type: "custom",
      dataType: "custom",
      path: "",
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
        <label htmlFor="endpointUrl">{t("newService.endpoint.url")}</label>
        <Track gap={8}>
          <Track style={{ width: "100%" }}>
            <div style={{ width: 108 }}>
              <FormSelect
                name={"request-type"}
                label={""}
                style={{ borderRadius: "4px 0 0 4px", borderRight: 0 }}
                options={[
                  { label: "GET", value: "GET" },
                  { label: "POST", value: "POST" },
                ]}
                onSelectionChange={(selection) => {
                  endpoint.definedEndpoints[0].methodType = selection?.value ?? "GET";
                }}
                defaultValue={endpoint.definedEndpoints[0]?.methodType ?? "GET"}
              />
            </div>
            <FormInput
              ref={ref}
              style={{ borderRadius: "0 4px 4px 0" }}
              name="endpointUrl"
              label=""
              defaultValue={endpoint.definedEndpoints[0].url ?? ""}
              value={endpoint.definedEndpoints[0].url ?? ""}
              onChange={(event) => {
                const parsedUrl = parseURL(event.target.value);
                endpoint.definedEndpoints[0].url = parsedUrl.url;
                const parameters: EndpointVariableData[] = [];
                Object.keys(parsedUrl.params).forEach((key) => {
                  parameters.push({
                    id: uuid(),
                    name: key,
                    type: "custom",
                    required: false,
                    value: parsedUrl.params[key],
                  });
                });

                endpoint.definedEndpoints[0].params = {
                  variables: parameters,
                  rawData: {},
                };
                refereshEndpoint();
              }}
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button
            onClick={async () => {
              try {
                new URL(endpoint.definedEndpoints[0].url ?? "");
                if (endpoint.definedEndpoints[0].methodType === "GET") {
                  await axios.post(getEndpointValidation(), {
                    url: endpoint.definedEndpoints[0].url ?? "",
                    type: "GET",
                  });
                } else {
                  await axios.post(getEndpointValidation(), {
                    url: endpoint.definedEndpoints[0].url ?? "",
                    type: "POST",
                  });
                }
                setUrlError(undefined);
                useToastStore.getState().success({
                  title: t("newService.endpoint.success"),
                });
              } catch (e) {
                setUrlError(t("newService.endpoint.error") ?? undefined);
              }
            }}
          >
            {t("newService.test")}
          </Button>
        </Track>
      </div>
      {urlError && (
        <div className={"toast toast--error"} style={{ padding: "8px 16px 8px 16px" }}>
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
        endpointData={endpoint.definedEndpoints[0]}
        requestTab={requestTab}
        setRequestTab={setRequestTab}
        parentEndpointId={endpoint.id}
        onParametersChange={(parameters) => {
          const url = new URL(endpoint.definedEndpoints[0].url ?? "");
          url.searchParams.forEach((_, key) => {
            url.searchParams.delete(key);
          });
          parameters.forEach((param: EndpointVariableData) => {
            url.searchParams.set(param.name, param.value ?? "");
          });
          endpoint.definedEndpoints[0].params = {
            variables: parameters,
            rawData: {},
          };
          endpoint.definedEndpoints[0].url = url.href ?? "";
          if (ref?.current) {
            ref.current.value = url.href ?? "";
          }
        }}
      />
    </Track>
  );
};

function parseURL(url: string) {
  try {
    const parsedURL = new URL(url);
    const params: { [key: string]: any } = Object.fromEntries(parsedURL.searchParams);

    return {
      url: parsedURL.href,
      params,
    };
  } catch (e) {
    return {
      url,
      params: {},
    };
  }
}

export default EndpointCustom;
