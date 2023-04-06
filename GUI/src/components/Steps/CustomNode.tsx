import { Dispatch, FC, SetStateAction } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from "react-icons/md";

import { Box, Button, Icon, Track } from "../";
import StepNode from "./StepNode";
import "./Node.scss";

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    setPopupVisible: Dispatch<SetStateAction<boolean>>;
    type: string;
    stepType: string;
    readonly: boolean;
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

  const isFinishingStep = () => {
    return data.type === "finishing-step";
  };

  return selected ? (
    <div className="selected">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ display: "none" }} />

      <Box color={boxTypeColors[data.type]}>
        <Track direction="horizontal" gap={4} align="left">
          <StepNode data={data} />
          <Button appearance="text" onClick={() => data.setPopupVisible(true)}>
            <Icon icon={data.readonly ? <MdOutlineRemoveRedEye /> : <MdOutlineEdit />} size="medium" />
            {t(data.readonly ? "global.view" : "overview.edit")}
          </Button>
          <Button appearance="text" onClick={() => data.onDelete(id)}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      </Box>

      {data.stepType === "input" ? (
        <>
          <Handle
            id={`handle-${id}-1`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="left-handle"
          />
          <Handle
            id={`handle-${id}-2`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="right-handle"
          />
        </>
      ) : (
        <Handle
          id={`handle-${id}-1`}
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable && !isFinishingStep()}
          hidden={isFinishingStep()}
        />
      )}
    </div>
  ) : (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <Track direction="horizontal" gap={4} align="left">
        <StepNode data={data} />
      </Track>

      {data.stepType === "input" ? (
        <>
          <Handle
            id={`handle-${id}-1`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="left-handle"
          />
          <Handle
            id={`handle-${id}-2`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="right-handle"
          />
        </>
      ) : (
        <Handle
          id={`handle-${id}-1`}
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable && !isFinishingStep()}
          hidden={isFinishingStep()}
        />
      )}
    </>
  );
};

export default CustomNode;
