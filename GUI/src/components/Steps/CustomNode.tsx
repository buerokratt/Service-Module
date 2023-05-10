import { Dispatch, FC, SetStateAction } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from "react-icons/md";

import { Box, Button, Icon, Track } from "../";
import StepNode from "./StepNode";
import "./Node.scss";
import { StepType } from "../../types";

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string, shouldAddPlaceholder: boolean) => void;
    onEdit: (id: string) => void;
    setClickedNode: Dispatch<SetStateAction<string>>;
    type: string;
    stepType: StepType;
    readonly: boolean;
    childrenCount: number;
  };
};

const boxTypeColors: { [key: string]: any } = {
  step: "blue",
  "finishing-step": "red",
  rule: "gray",
};

const CustomNode: FC<NodeProps & NodeDataProps> = (props) => {
  const { t } = useTranslation();
  const { data, isConnectable, id, selected } = props;
  const shouldOffsetHandles = data.childrenCount > 1;
  const handleOffset = 25;
  let offsetLeft = handleOffset * Math.floor(data.childrenCount / 2);
  if (data.childrenCount % 2 === 0) offsetLeft -= handleOffset / 2;

  const isFinishingStep = () => {
    return data.type === "finishing-step";
  };

  const bottomHandles = (): JSX.Element => {
    return (
      <>
        {new Array(data.childrenCount).fill(0).map((_, i) => (
          <Handle
            key={`handle-${id}-${i}`}
            id={`handle-${id}-${i}`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={shouldOffsetHandles ? { marginLeft: -offsetLeft + i * handleOffset } : {}}
            hidden={isFinishingStep()}
          />
        ))}
      </>
    );
  };

  return selected ? (
    <div className="selected">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ display: "none" }} />

      <Box color={boxTypeColors[data.type]}>
        <Track direction="horizontal" gap={4} align="left">
          <StepNode data={data} />
          {data.stepType !== "rule" && (
            <>
              <Button
                appearance="text"
                onClick={() => {
                  data.setClickedNode(id);
                  data.onEdit(id);
                }}
              >
                <Icon icon={data.readonly ? <MdOutlineRemoveRedEye /> : <MdOutlineEdit />} size="medium" />
                {t(data.readonly ? "global.view" : "overview.edit")}
              </Button>
              <Button appearance="text" onClick={() => data.onDelete(id, true)}>
                <Icon icon={<MdDeleteOutline />} size="medium" />
                {t("overview.delete")}
              </Button>
            </>
          )}
        </Track>
      </Box>
      {bottomHandles()}
    </div>
  ) : (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Track direction="horizontal" gap={4} align="left">
        <StepNode data={data} />
      </Track>
      {bottomHandles()}
    </>
  );
};

export default CustomNode;
