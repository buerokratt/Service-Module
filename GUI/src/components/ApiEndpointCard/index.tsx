import { FC, useEffect, useState } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import { Button, EndpointCustom, EndpointOpenAPI, FormInput, FormSelect, Icon, Track } from "..";

import { Option } from "../../types/option";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import "./ApiEndpointCard.scss";
import { RequestTab } from "../../types";
import { EndpointData, EndpointEnv, EndpointTab } from "../../types/endpoint";

type EndpointCardProps = {
  onDelete: () => void;
  endpoint: EndpointData;
  setEndpoints: React.Dispatch<React.SetStateAction<EndpointData[]>>;
  requestValues: string[];
};

const ApiEndpointCard: FC<EndpointCardProps> = ({ onDelete, setEndpoints, endpoint, requestValues }) => {
  const [selectedTab, setSelectedTab] = useState<EndpointEnv>(EndpointEnv.Live);
  const [endpointName, setEndpointName] = useState<string>(endpoint.name);
  const [testEnvExists, setTestEnvExists] = useState<boolean>(false);
  const options = [
    { label: "Open API", value: "openAPI", name: "da" },
    { label: "Custom endpoint", value: "custom", name: "da" },
  ];
  const [option, setOption] = useState<Option | null>(options.find((o) => o.value === endpoint.type) ?? null);
  const [requestTab, setRequestTab] = useState<RequestTab>({ tab: EndpointTab.Params, showRawData: false });
  const { t } = useTranslation();

  const getTabTriggerClasses = (tab: EndpointEnv) => `tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  useEffect(() => {
    endpoint.name = endpointName;
    setEndpoints((pe) => [...pe]);
  }, [endpointName]);

  return (
    <Tabs.Root
      defaultValue={EndpointEnv.Live}
      onValueChange={(value) => {
        setSelectedTab(value as EndpointEnv);
        if (value === EndpointEnv.Test) setTestEnvExists(true);
      }}
      className="tab-group"
    >
      <Track justify="between">
        <Tabs.List className="tab-group__list" aria-label="environment">
          <Tabs.Trigger className={getTabTriggerClasses(EndpointEnv.Live)} value={EndpointEnv.Live}>
            {t("newService.endpoint.live")}
          </Tabs.Trigger>
          <Tabs.Trigger className={getTabTriggerClasses(EndpointEnv.Test)} value={EndpointEnv.Test}>
            {t(testEnvExists ? "newService.endpoint.testEnv" : "newService.endpoint.addTestEnv")}
          </Tabs.Trigger>
        </Tabs.List>
        <>
          <Button appearance="text" onClick={onDelete} style={{ color: "#9799A4" }}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </>
      </Track>
      {[EndpointEnv.Live, EndpointEnv.Test].map((env) => {
        return (
          <Tabs.Content className="tab-group__tab-content" value={env} key={env}>
            <Track direction="vertical" align="stretch" gap={16}>
              <div>
                <label htmlFor="service-type">{t("newService.uses")}</label>
                <FormSelect
                  name="service-type"
                  label={""}
                  options={options}
                  disabled={selectedTab === EndpointEnv.Test}
                  placeholder={t("global.choose") ?? ""}
                  onSelectionChange={(selection) => {
                    setOption(selection);
                    setEndpoints((prevEndpoints) => {
                      prevEndpoints.map((prevEndpoint) => {
                        if (prevEndpoint.id !== endpoint.id) return prevEndpoint;
                        prevEndpoint.type = selection?.value;
                        return prevEndpoint;
                      });
                      return prevEndpoints;
                    });
                  }}
                  defaultValue={option?.value}
                />
              </div>
              {option && (
                <div>
                  <label htmlFor="endpointName">{t("newService.endpoint.name")}</label>
                  <FormInput
                    name="endpointName"
                    label=""
                    value={endpointName}
                    disabled={selectedTab === EndpointEnv.Test}
                    onChange={(e) => setEndpointName(e.target.value)}
                  />
                </div>
              )}
              {option?.value === "openAPI" && (
                <EndpointOpenAPI
                  endpoint={endpoint}
                  isLive={selectedTab === EndpointEnv.Live}
                  requestTab={requestTab}
                  requestValues={requestValues}
                  setEndpoints={setEndpoints}
                  setRequestTab={setRequestTab}
                />
              )}
              {option?.value === "custom" && (
                <EndpointCustom
                  endpoint={endpoint}
                  isLive={selectedTab === EndpointEnv.Live}
                  requestTab={requestTab}
                  requestValues={requestValues}
                  setEndpoints={setEndpoints}
                  setRequestTab={setRequestTab}
                />
              )}
            </Track>
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};

export default ApiEndpointCard;
