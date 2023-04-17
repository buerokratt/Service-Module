import { FC, useState } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import {
  Button,
  EndpointCustom,
  EndpointOpenAPI,
  EndpointResqlComponent,
  FormInput,
  FormSelect,
  Icon,
  Track,
} from "..";
import { Option } from "../../types/option";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import "./APIEndpointCard.scss";
type EndpointCardProps = {
  onDelete: () => void;
};

const APIEndpointCard: FC<EndpointCardProps> = ({ onDelete }) => {
  const [option, setOption] = useState<Option | null>();
  const [selectedTab, setSelectedTab] = useState<string>("live");
  const [endpointName, setEndpointName] = useState<string>();
  const [testEnvExists, setTestEnvExists] = useState<boolean>(false);
  const options = [
    { label: "Open API", value: "openAPI", name: "da" },
    { label: "Custom endpoint", value: "custom", name: "da" },
    { label: "Internal Resql component", value: "resql", name: "da" },
  ];
  const { t } = useTranslation();

  const getTabTriggerClasses = (tab: string) =>
    `tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  return (
    <Tabs.Root
      defaultValue="live"
      onValueChange={(value) => {
        setSelectedTab(value);
        if (value === "test") setTestEnvExists(true);
      }}
      className="tab-group"
    >
      <Track justify="between">
        <Tabs.List className="tab-group__list" aria-label="environment">
          <Tabs.Trigger className={getTabTriggerClasses("live")} value="live">
            {t("newService.endpoint.live")}
          </Tabs.Trigger>
          <Tabs.Trigger className={getTabTriggerClasses("test")} value="test">
            {t(
              testEnvExists
                ? "newService.endpoint.testEnv"
                : "newService.endpoint.addTestEnv"
            )}
          </Tabs.Trigger>
        </Tabs.List>
        <>
          <Button
            appearance="text"
            onClick={onDelete}
            style={{ color: "#9799A4" }}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </>
      </Track>
      <Tabs.Content className="tab-group__tab-content" value="live">
        <Track direction="vertical" align="stretch" gap={16}>
          <div>
            <label htmlFor="service-type">{t("newService.uses")}</label>
            <FormSelect
              name="service-type"
              label={""}
              options={options}
              placeholder={t("global.choose") ?? ""}
              onSelectionChange={(selection) => setOption(selection)}
              defaultValue={option?.value}
            />
          </div>
          {option && (
            <div>
              <label htmlFor="endpointName">
                {t("newService.endpoint.name")}
              </label>
              <FormInput
                name="endpointName"
                label=""
                value={endpointName}
                onChange={(e) => setEndpointName(e.target.value)}
              />
            </div>
          )}
          {option?.value === "openAPI" && <EndpointOpenAPI />}
          {option?.value === "custom" && <EndpointCustom />}
          {option?.value === "resql" && <EndpointResqlComponent />}
        </Track>
      </Tabs.Content>
      <Tabs.Content className="tab-group__tab-content" value="test">
        <Track direction="vertical" align="stretch" gap={16}>
          <div>
            <label htmlFor="service-type">{t("newService.uses")}</label>
            <FormSelect
              name="service-type"
              label={""}
              disabled
              placeholder={t("global.choose") ?? ""}
              options={options}
              defaultValue={option?.value}
            />
          </div>
          {option && (
            <div>
              <label htmlFor="endpointName">
                {t("newService.endpoint.name")}
              </label>
              <FormInput
                name="endpointName"
                label=""
                value={endpointName}
                disabled
              />
            </div>
          )}
          {option?.value === "openAPI" && <EndpointOpenAPI />}
          {option?.value === "custom" && <EndpointCustom />}
          {option?.value === "resql" && <EndpointResqlComponent />}
        </Track>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default APIEndpointCard;
