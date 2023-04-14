import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { Button, FormInput, FormSelect, Icon, Track } from "../../..";
import * as Tabs from "@radix-ui/react-tabs";
import DataTable from "../../../DataTable";
import { dummyVariableOptions } from "../../../../resources/api-constants";
import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { Option } from "../../../../types/option";

const EndpointCustom: React.FC = () => {
  const { t } = useTranslation();
  const tabs = ["Params", "Header", "Body"];
  const [error, setError] = useState<string | null>();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const [endpoint, setEndpoint] = useState<string>("");
  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<{
    [label: string]: string;
  }>({});
  const columnHelper = createColumnHelper<{
    variable: string;
    value: any;
  }>();

  const getTabTriggerClasses = (tab: string) =>
    `endpoint-tab-group__tab-btn ${selectedTab === tab ? "active" : ""}`;

  const getKey = (id: string, source: string) =>
    `${selectedTab}-${source}-${id}`;

  const updateSelection = (
    id: string,
    source: string,
    selection: Option | null
  ) => {
    if (!selection) return;
    selectedOptions[getKey(id, source)] = selection.value;
  };

  const sortRows = (rowA: any, rowB: any, source: string): number => {
    const valueA = selectedOptions[getKey(rowA.id, source)] ?? "";
    const valueB = selectedOptions[getKey(rowB.id, source)] ?? "";
    return valueA < valueB ? 1 : -1;
  }

  const columns = [
    columnHelper.accessor("variable", {
      header: t("newService.endpoint.variable") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: any, rowB: any) => sortRows(rowA, rowB, 'variable'),
      cell: (props) => {
        return (
          <FormInput
            style={{ borderRadius: "0 4px 4px 0" }}
            name={`endpoint-variable-${props.row.id}`}
            label=""
            onChange={(event) =>
              (selectedOptions[getKey(props.row.id, "variable")] =
                event.target.value)
            }
            defaultValue={selectedOptions[getKey(props.row.id, "variable")]}
            placeholder={"Muutuja.."}
          />
        );
      },
    }),
    columnHelper.accessor("value", {
      header: t("newService.endpoint.value") ?? "",
      meta: {
        size: "50%",
      },
      sortingFn: (rowA: any, rowB: any) => sortRows(rowA, rowB, 'value'),
      cell: (props) => {
        const selectedOption = selectedOptions[getKey(props.row.id, "value")];
        return (
          <FormSelect
            name={props.row.original.variable}
            label={""}
            options={dummyVariableOptions}
            defaultValue={selectedOption}
            onSelectionChange={(selection) =>
              updateSelection(props.row.id, "value", selection)
            }
          />
        );
      },
    }),
  ];

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
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder={t("newService.endpoint.insert") ?? ""}
            />
          </Track>
          <Button
            onClick={() => {
              const errorMsg = endpoint
                ? undefined
                : t("newService.endpoint.error");
              setShowTable(!errorMsg);
              setError(errorMsg);
            }}
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
      {showTable && (
        <Tabs.Root
          defaultValue={selectedTab}
          onValueChange={(value) => setSelectedTab(value)}
          className="endpoint-tab-group"
        >
          <Tabs.List
            className="endpoint-tab-group__list"
            aria-label="environment"
          >
            {tabs.map((tab) => (
              <Tabs.Trigger
                className={getTabTriggerClasses(tab)}
                value={tab}
                key={tab}
              >
                {tab}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Content
              className="endpoint-tab-group__tab-content"
              value={tab}
              key={tab}
            >
              <DataTable
                sortable={true}
                data={[{}, {}, {}]}
                columns={columns}
              />
              <hr style={{ margin: 0, borderTop: "1px solid #D2D3D8" }} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </Track>
  );
};

export default EndpointCustom;
