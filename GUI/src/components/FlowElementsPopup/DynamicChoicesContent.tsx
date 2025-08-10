import { FC, useEffect } from "react";
import Track from "../Track";
import PreviousVariables from "./PreviousVariables";
import { DynamicChoices } from "types/dynamic-choices";
import AssignElement from "./AssignBuilder/assignElement";

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
    label: "List",
    tooltip: "The list of items to choose from",
  },
  {
    key: "serviceName",
    label: "Service Name",
    tooltip: "The name of the service providing dynamic choices",
  },
  {
    key: "key",
    label: "key",
    tooltip: "The key to use for selection",
  },
  {
    key: "payloadKeys",
    label: "Payload Keys",
    tooltip: "Comma-separated keys to include in the payload",
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
          <AssignElement
            key={field.key}
            manualEdit={true}
            isKeyEditable={false}
            keyStyle={{
              textAlign: "center",
              border: "0.5px",
              backgroundColor: "#00f5",
            }}
            element={{
              id: field.key,
              key: field.label,
              value: dynamicChoices[field.key],
              tooltip: field.tooltip,
            }}
            onChange={(element) => handleChange(field.key, element.value)}
          />
        ))}
      </Track>
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default DynamicChoicesContent;
