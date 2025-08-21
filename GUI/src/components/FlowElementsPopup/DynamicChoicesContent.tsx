import { FC } from "react";
import Track from "../Track";
import PreviousVariables from "./PreviousVariables";
import { DynamicChoices } from "types/dynamic-choices";
import AssignElement from "./AssignBuilder/AssignElement";
import { MdOutlineInfo } from "react-icons/md";
import Tooltip from "components/Tooltip";
import { t } from "i18next";

type DynamicChoicesContentProps = {
  readonly nodeId: string;
  readonly dynamicChoices?: DynamicChoices;
  readonly onDynamicChoicesChange?: (dynamicChoices: DynamicChoices) => void;
};

const fields: Array<{
  key: keyof DynamicChoices;
  label: string;
  tooltip: string;
}> = [
  {
    key: "list",
    label: t("serviceFlow.element.dynamicChoices.list"),
    tooltip: t("serviceFlow.element.dynamicChoices.listTooltip"),
  },
  {
    key: "serviceName",
    label: t("serviceFlow.element.dynamicChoices.serviceName"),
    tooltip: t("serviceFlow.element.dynamicChoices.serviceNameTooltip"),
  },
  {
    key: "key",
    label: t("serviceFlow.element.dynamicChoices.key"),
    tooltip: t("serviceFlow.element.dynamicChoices.keyTooltip"),
  },
  {
    key: "payloadKeys",
    label: t("serviceFlow.element.dynamicChoices.payloadKeys"),
    tooltip: t("serviceFlow.element.dynamicChoices.payloadKeysTooltip"),
  },
];

const DynamicChoicesContent: FC<DynamicChoicesContentProps> = ({
  nodeId,
  dynamicChoices = {
    list: "",
    serviceName: "",
    key: "",
    payloadKeys: "",
  },
  onDynamicChoicesChange,
}) => {
  const handleChange = (field: keyof DynamicChoices, value: string) => {
    onDynamicChoicesChange?.({
      ...dynamicChoices,
      [field]: value,
    });
  };

  return (
    <Track direction="vertical" align="stretch" gap={16} style={{ width: "100%" }}>
      <Track direction="vertical" align="stretch" gap={16} style={{ padding: "16px", width: "100%" }}>
        {fields.map((field) => (
          <Track key={field.key} gap={8}>
            <AssignElement
              key={field.key}
              manualEdit={true}
              isKeyEditable={false}
              keyStyle={{
                textAlign: "center",
                border: "0.5px",
                backgroundColor: "#00f5",
                fontSize: "14px",
              }}
              element={{
                id: field.key,
                key: field.label,
                value: dynamicChoices[field.key],
                tooltip: field.tooltip,
              }}
              onChange={(element) => handleChange(field.key, element.value)}
            />
            <Tooltip content={field.tooltip}>
              <MdOutlineInfo size={20} color={"#005aa3"} />
            </Tooltip>
          </Track>
        ))}
      </Track>
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default DynamicChoicesContent;
