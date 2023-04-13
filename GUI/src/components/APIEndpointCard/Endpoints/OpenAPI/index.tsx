import React, { useState } from "react";
import {
  dummyEndpointsData,
  dummyVariableOptions,
  dummyVariablesData,
} from "../../../../resources/api-constants";
import { Button, FormInput, FormSelect, Track } from "../../..";
import { Option } from "../../../../types/option";
import DataTable from "../../../DataTable";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

const EndpointOpenAPI: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Option | null>();
  const [endpoints, setEndpoints] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [label: string]: string;
  }>({});
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<{ variable: string; value: any }>();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
      cell: (props) => (
        <FormSelect
          name={props.row.original.variable}
          label={""}
          options={dummyVariableOptions}
          defaultValue={
            selectedOptions[
              getKey(selectedEndpoint?.value, props.row.original.variable)
            ]
          }
          onSelectionChange={(selection) =>
            updateSelection(props.row.original.variable, selection)
          }
        />
      ),
    }),
  ];

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="name">{t("newService.endpoint.url")}</label>
        <Track gap={8}>
          <FormInput
            name="name"
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
        <label htmlFor="select-endpoint">{t("newService.endpoints")}</label>
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
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </Track>
  );
};

export default EndpointOpenAPI;
