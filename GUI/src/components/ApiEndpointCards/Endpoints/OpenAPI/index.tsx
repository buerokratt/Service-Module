import React, { useState } from "react";
import {
  dummyEndpointsData,
  dummyVariableOptions,
  dummyVariablesData,
} from "../../../../resources/api-constants";
import { Button, FormInput, FormSelect, Icon, Tooltip, Track } from "../../..";
import { Option } from "../../../../types/option";
import DataTable from "../../../DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";

const EndpointOpenAPI: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Option | null>();
  const [endpoints, setEndpoints] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [label: string]: string;
  }>({});
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<{
    variable: string;
    required: boolean;
    value: any;
  }>();

  const getKey = (endpoint: string | undefined, optionValue: string) =>
    `${endpoint}-${optionValue}`;

  const updateSelection = (label: string, selection: Option | null) => {
    if (!selection) return;
    selectedOptions[getKey(selectedEndpoint?.value, label)] = selection.value;
  };

  const columns = [
    columnHelper.accessor("variable", {
      header: t("newService.endpoint.variable") ?? "",
    }),
    columnHelper.accessor("value", {
      header: t("newService.endpoint.value") ?? "",
      cell: (props) => {
        const selectedOption =
          selectedOptions[
            getKey(selectedEndpoint?.value, props.row.original.variable)
          ];
        return (
          <FormSelect
            name={props.row.original.variable}
            label={""}
            options={dummyVariableOptions}
            defaultValue={selectedOption}
            onSelectionChange={(selection) =>
              updateSelection(props.row.original.variable, selection)
            }
          />
        );
      },
    }),
    columnHelper.display({
      id: "delete",
      meta: {
        size: 60,
      },
      cell: (props) => {
        return (
          <Track justify="center">
            {props.row.original.required ? (
              <Tooltip content={t("newService.endpoint.required")}>
                <span className="variable-required">!</span>
              </Tooltip>
            ) : (
              <Button appearance="text">
                <Icon icon={<MdDeleteOutline />} size="medium" />
              </Button>
            )}
          </Track>
        );
      },
    }),
  ];

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="endpointUrl">{t("newService.endpoint.url")}</label>
        <Track gap={8}>
          <FormInput
            name="endpointUrl"
            label=""
            placeholder={t("newService.endpoint.insert") ?? ""}
          />
          <Button onClick={() => setEndpoints(dummyEndpointsData)}>
            {t("newService.endpoint.ask")}
          </Button>
        </Track>
      </div>
      {endpoints.length > 0 && (
        <div>
          <label htmlFor="select-endpoint">
            {t("newService.endpoint.single")}
          </label>
          <FormSelect
            name={"select-endpoint"}
            label={""}
            options={endpoints}
            onSelectionChange={(value) => setSelectedEndpoint(value)}
          />
        </div>
      )}
      {selectedEndpoint && (
        <DataTable
          sortable={true}
          data={dummyVariablesData}
          columns={columns}
        />
      )}
    </Track>
  );
};

export default EndpointOpenAPI;
