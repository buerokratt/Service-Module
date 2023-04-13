import { FC, useState } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import { EndpointCustom, EndpointOpenAPI, FormSelect, Track } from "..";
import { Option } from "../../types/option";
import { useTranslation } from "react-i18next";

const APIEndpointCard: FC = () => {
  const [option, setOption] = useState<Option | null>();
  const [selectedTab, setSelectedTab] = useState<string>("live");
  const options: Option[] = [
    { label: "Open API", value: "openAPI" },
    { label: "Custom endpoint", value: "custom" },
  ];
  const { t } = useTranslation();

  const getTabTriggerClasses = (tab: string) =>
    `tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  return (
    <Tabs.Root
      defaultValue="live"
      onValueChange={(value) => setSelectedTab(value)}
    >
      <Tabs.List className="tab-group__list" aria-label="environment">
        <Tabs.Trigger className={getTabTriggerClasses("live")} value="live">
          {t("newService.endpoint.live")}
        </Tabs.Trigger>
        <Tabs.Trigger className={getTabTriggerClasses("test")} value="test">
          {/* TODO update text value based on if test environment is present */}
          {t("newService.endpoint.test")}
        </Tabs.Trigger>
      </Tabs.List>
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
              style={{color: option ? 'black' : '#9799A4'}}
            />
          </div>
          {option?.value === "openAPI" && <EndpointOpenAPI />}
          {option?.value === "custom" && <EndpointCustom />}
        </Track>
      </Tabs.Content>
      <Tabs.Content className="tab-group__tab-content" value="test">
        <h5>{t("newService.endpoint.api")}</h5>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default APIEndpointCard;
