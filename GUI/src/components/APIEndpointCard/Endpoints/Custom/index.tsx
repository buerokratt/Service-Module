import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { Button, FormInput, FormSelect, Icon, RequestVariables, Track } from "../../..";
import { EndpointData } from "../../../../types/endpoint-data";
import { EndpointTab } from "../../../../types/endpoint-tab.enum";
import { EndpointType } from "../../../../types/endpoint-type";
import { EndpointVariableData } from "../../../../types/endpoint-variable-data";
import { LastUpdatedRow } from "../../../../types/last-updated-row";
import { Option } from "../../../../types/option";
import { RequestTab } from "../../../../types/request-tab";
import { RequestVariablesTabsRawData } from "../../../../types/request-variables-tabs-raw-data";
import { RequestVariablesTabsRowsData } from "../../../../types/request-variables-tabs-rows-data";

type EndpointCustomProps = {
  endpoint: EndpointData;
  setEndpoints: React.Dispatch<React.SetStateAction<EndpointData[]>>;
  isLive: boolean;
  requestValues: string[];
  requestTab: RequestTab;
  setRequestTab: React.Dispatch<React.SetStateAction<RequestTab>>;
};

const EndpointCustom: React.FC<EndpointCustomProps> = ({
  endpoint,
  setEndpoints,
  isLive,
  requestValues,
  requestTab,
  setRequestTab,
}) => {
  const { t } = useTranslation();
  const [urlError, setUrlError] = useState<string>();
  const [showContent, setShowContent] = useState<boolean>(!!endpoint.definedEndpoints[0]?.url);
  const [key, setKey] = useState<number>(0);

  // initial endpoint data
  if (endpoint.definedEndpoints.length === 0) {
    endpoint.definedEndpoints.push({
      id: uuid(),
      label: "",
      methodType: "GET",
      type: "custom",
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

  const updateEndpointData = (data: RequestVariablesTabsRowsData, endpointId?: string) => {
    if (!endpointId) return;
    setEndpoints((prevEndpoints) => {
      return prevEndpoints.map((prevEndpoint: EndpointData) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((defEndpoint) => {
          if (defEndpoint.id !== endpointId) return defEndpoint;
          Object.keys(data).forEach((key) => {
            data[key as EndpointTab]?.forEach((row) => {
              if (
                !row.endpointVariableId &&
                row.variable &&
                !defEndpoint[key as EndpointTab]?.variables.map((e) => e.name).includes(row.variable)
              ) {
                const newVariable: EndpointVariableData = {
                  id: uuid(),
                  name: row.variable,
                  type: "custom",
                  required: false,
                };
                newVariable[isLive ? "value" : "testValue"] = row.value;
                defEndpoint[key as EndpointTab]?.variables.push(newVariable);
                console.log("u", defEndpoint[key as EndpointTab]?.variables);
              }
            });
            defEndpoint[key as EndpointTab]?.variables.forEach((variable) => {
              const updatedVariable = data[key as EndpointTab]!.find(
                (updated) => updated.endpointVariableId === variable.id
              );
              variable[isLive ? "value" : "testValue"] = updatedVariable?.value;
              variable.name = updatedVariable?.variable ?? variable.name;
            });
          });
          return defEndpoint;
        });
        return prevEndpoint;
      });
    });
    setKey(key + 1);
  };

  const updateEndpointRawData = (data: RequestVariablesTabsRawData, endpointId?: string) => {
    if (!endpointId) return;
    setEndpoints((prevEndpoints) => {
      return prevEndpoints.map((prevEndpoint: EndpointData) => {
        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
        prevEndpoint.definedEndpoints.map((defEndpoint) => {
          if (defEndpoint.id !== endpointId) return defEndpoint;
          Object.keys(data).forEach((key) => {
            if (defEndpoint[key as EndpointTab]) {
              defEndpoint[key as EndpointTab]!.rawData[isLive ? "value" : "testValue"] = data[key as EndpointTab];
            }
          });
          return defEndpoint;
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
                defaultValue="GET"
              />
            </div>
            <FormInput
              style={{ borderRadius: "0 4px 4px 0" }}
              name="endpointUrl"
              label=""
              defaultValue={endpoint.definedEndpoints[0].url ?? ""}
              onChange={(event) => (endpoint.definedEndpoints[0].url = event.target.value)}
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button
            onClick={() => {
              // TODO check if url is legit
              const errorMsg = endpoint ? undefined : t("newService.endpoint.error");
              setShowContent(!errorMsg);
              setUrlError(errorMsg);
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
      {showContent && (
        <RequestVariables
          key={key}
          requestValues={requestValues}
          updateEndpointData={updateEndpointData}
          updateEndpointRawData={updateEndpointRawData}
          isLive={isLive}
          endpointData={endpoint.definedEndpoints[0]}
          requestTab={requestTab}
          setRequestTab={setRequestTab}
          setEndpoints={setEndpoints}
        />
      )}
    </Track>
  );
};

export default EndpointCustom;
