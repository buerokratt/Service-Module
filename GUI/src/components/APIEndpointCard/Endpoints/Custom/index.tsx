import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { Button, FormInput, FormSelect, Icon, Track } from "../../..";

const EndpointCustom: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>();

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
                defaultValue="GET"
              />
            </div>
            <FormInput
              style={{ borderRadius: "0 4px 4px 0" }}
              name="endpointUrl"
              label=""
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button
            onClick={() =>
              setError(error ? undefined : t("newService.endpoint.error"))
            }
          >
            {t("newService.test")}
          </Button>
        </Track>
      </div>
      {error && (
        <div
          className={"toast toast--error"}
          style={{ padding: "8px 16px 8px 16px" }}
        >
          <div className="toast__title">
            <Icon icon={<MdErrorOutline />} />
            {error}
          </div>
        </div>
      )}
    </Track>
  );
};

export default EndpointCustom;
