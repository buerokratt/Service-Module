import React from "react";
import { useTranslation } from "react-i18next";
import { Button, FormInput, FormSelect, Track } from "../../..";

const EndpointCustom: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="name">{t("newService.endpoint.url")}</label>
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
                defaultValue="GET"
              />
            </div>
            <FormInput
              style={{ borderRadius: "0 4px 4px 0" }}
              name="name"
              label="Nimetus"
              hideLabel
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button>{t("newService.test")}</Button>
        </Track>
      </div>
    </Track>
  );
};

export default EndpointCustom;
