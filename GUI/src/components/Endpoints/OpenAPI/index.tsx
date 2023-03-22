import React, { useState } from "react";
import {
  dummyEndpointsData,
  dummyVariableOptions,
  dummyVariablesData,
} from "../../../resources/api-constants";
import { Button, FormInput, FormSelect, Track } from "../..";
import { Option } from "../../../types/option";
import DataTable from "../../DataTable";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";

const EndpointOpenAPI: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Option | null>();
  const [endpoints, setEndpoints] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    [label: string]: string;
  }>({});
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
      header: "Muutuja",
    }),
    columnHelper.accessor("value", {
      header: "Väärtus",
      cell: (props) => (
        <FormSelect
          name={props.row.original.variable}
          label={props.row.original.variable}
          hideLabel
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
        <label htmlFor="name">API otspunkti URL</label>
        <Track gap={8}>
          <FormInput
            name="name"
            label="Nimetus"
            hideLabel
            placeholder="Sisesta API otspunkt.."
          />
          <Button onClick={() => setEndpoints(dummyEndpointsData)}>
            Küsi otspunktid
          </Button>
        </Track>
      </div>
      {endpoints.length > 0 && (
        <div>
        <label htmlFor="select-endpoint">Otspunktid</label>
        <FormSelect
          name={""}
          label={"select-endpoint"}
          placeholder={"Vali.."}
          options={endpoints}
          hideLabel
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
