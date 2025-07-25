import { FC, useEffect, useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button, EndpointCustom, EndpointOpenAPI, FormInput, FormSelect, Icon, Switch, Track } from "..";
import { Option } from "../../types/option";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import "./ApiEndpointCard.scss";
import { RequestTab } from "../../types";
import { EndpointData, EndpointEnv, EndpointTab } from "../../types/endpoint";
import useServiceStore from "store/new-services.store";
import { EndpointType } from "types/endpoint/endpoint-type";

type EndpointCardProps = {
  endpoint: EndpointData;
  isDeletable?: boolean;
  isNameDisabled?: boolean;
  onNameChange?: (name: string) => void;
  onNameExists?: (exists: boolean) => void;
  onCommonChange?: (isCommon: boolean) => void;
};

const ApiEndpointCard: FC<EndpointCardProps> = ({
  endpoint,
  isDeletable = true,
  isNameDisabled = false,
  onNameExists,
  onNameChange,
  onCommonChange,
}) => {
  const { deleteEndpoint, changeServiceEndpointType, getAvailableRequestValues } = useServiceStore();
  const [selectedTab, setSelectedTab] = useState<EndpointEnv>(EndpointEnv.Live);
  const [endpointName, setEndpointName] = useState<string>(endpoint.name);
  const [isCommonEndpoint, setIsCommonEndpoint] = useState<boolean>(endpoint.isCommon ?? false);
  const [testEnvExists, setTestEnvExists] = useState<boolean>(false);
  const options: { label: string; value: EndpointType; name: string }[] = [
    { label: "Open API", value: "openApi", name: "" },
    { label: "Custom endpoint", value: "custom", name: "" },
  ];
  const [option, setOption] = useState<Option | null>(options.find((o) => o.value === endpoint.type) ?? null);
  const [requestTab, setRequestTab] = useState<RequestTab>({ tab: EndpointTab.Params, showRawData: false });
  const [nameExists, setNameExists] = useState<boolean>(false);
  const { t } = useTranslation();

  const getTabTriggerClasses = (tab: EndpointEnv) => `tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  useEffect(() => {
    if (endpoint.hasTestEnv) setTestEnvExists(true);
  }, [endpoint.hasTestEnv]);

  const requestValues = useMemo(() => getAvailableRequestValues(endpoint.endpointId), []);

  return (
    <Tabs.Root
      defaultValue={EndpointEnv.Live}
      onValueChange={(value) => {
        setSelectedTab(value as EndpointEnv);
        if (value === EndpointEnv.Test) endpoint.hasTestEnv = true;
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
        {isDeletable && (
          <Button appearance="text" onClick={() => deleteEndpoint(endpoint.endpointId)} style={{ color: "#9799A4" }}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        )}
      </Track>
      {[EndpointEnv.Live, EndpointEnv.Test].map((env) => {
        return (
          <Tabs.Content className="tab-group__tab-content" value={env} key={env}>
            <Track direction="vertical" align="stretch" gap={16}>
              <Track isMultiline>
                <label htmlFor="service-type">{t("newService.uses")}</label>
                <FormSelect
                  name="service-type"
                  label=""
                  placeholder={t("newService.endpoint.type").toString()}
                  options={options}
                  disabled={selectedTab === EndpointEnv.Test}
                  onSelectionChange={(selection) => {
                    setOption(selection);
                    endpoint.type = selection?.value as EndpointType;
                    changeServiceEndpointType(endpoint.endpointId, (selection?.value ?? "custom") as EndpointType);
                  }}
                  defaultValue={option?.value}
                />
              </Track>
              {option && (
                <div>
                  <label htmlFor="endpointName">{t("newService.endpoint.name")}</label>
                  <FormInput
                    name="endpointName"
                    label=""
                    placeholder={t("newService.endpoint.insertName").toString()}
                    value={endpointName}
                    disabled={isNameDisabled || selectedTab === EndpointEnv.Test}
                    onChange={(e) => {
                      setEndpointName(e.target.value);
                      const endpointsNames = useServiceStore
                        .getState()
                        .endpoints.map((ep) => ep.name)
                        .filter((name) => name !== endpoint.name);
                      const isNameExist = endpointsNames.includes(e.target.value);
                      setNameExists(isNameExist);
                      onNameExists?.(isNameExist);
                      onNameChange?.(e.target.value);
                    }}
                  />
                  {nameExists && (
                    <span style={{ color: "red", fontSize: "13px" }}>{t("newService.endpoint.nameAlreadyExists")}</span>
                  )}
                </div>
              )}
              {option?.value === "openApi" && (
                <EndpointOpenAPI
                  endpoint={endpoint}
                  isLive={selectedTab === EndpointEnv.Live}
                  requestTab={requestTab}
                  setRequestTab={setRequestTab}
                  requestValues={requestValues}
                />
              )}
              {option?.value === "custom" && (
                <EndpointCustom
                  endpoint={endpoint}
                  isLive={selectedTab === EndpointEnv.Live}
                  requestTab={requestTab}
                  setRequestTab={setRequestTab}
                  requestValues={requestValues}
                />
              )}
              {option?.value && (
                <Track gap={16}>
                  <label htmlFor="isCommon">{t("newService.endpoint.publicEndpoint")}</label>
                  <Switch
                    name="isCommon"
                    label=""
                    onLabel={t("global.yes").toString()}
                    offLabel={t("global.no").toString()}
                    value={isCommonEndpoint}
                    checked={isCommonEndpoint}
                    onCheckedChange={(value) => {
                      setIsCommonEndpoint(value);
                      onCommonChange?.(value);
                    }}
                  />
                </Track>
              )}
            </Track>
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
};

export default ApiEndpointCard;
