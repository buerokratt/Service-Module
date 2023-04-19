import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormSelect, Track } from "../../..";
import RequestVariables from "../RequestVariables";
import { Option } from "../../../../types/option";

const EndpointResqlComponent: React.FC = () => {
  const { t } = useTranslation();
  // These resql endpoints will have been fethced/known beforehand
  const endpoints = [
    { label: "/resql/add", value: "/resql/add" },
    { label: "/resql/update", value: "/resql/update" },
  ];
  const [endpoint, setEndpoint] = useState<Option | null>();

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="resql-enpoints">
          {t("newService.endpoint.single")}
        </label>
        <FormSelect
          name={"resql-enpoints"}
          label={""}
          options={endpoints}
          placeholder={t("global.choose") ?? ""}
          onSelectionChange={(selection) => setEndpoint(selection)}
        />
      </div>
      {endpoint && <RequestVariables />}
    </Track>
  );
};

export default EndpointResqlComponent;
