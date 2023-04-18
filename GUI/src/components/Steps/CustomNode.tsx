import { Dispatch, FC, SetStateAction } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";

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
  };
};

const CustomNode: FC<NodeProps & NodeDataProps> = (props) => {
  const { t } = useTranslation();
  const { data, isConnectable, id, selected } = props;

  return selected ? (
    <div className="selected">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ display: "none" }}
      />

      <Box color={data.type === "finishing-step" ? "red" : "blue"}>
        <Track direction="horizontal" gap={4} align="left">
          <StepNode data={data} />
          <Button appearance="text" onClick={() => data.setPopupVisible(true)}>
            <Icon icon={<MdOutlineEdit />} size="medium" />
            {t("overview.edit")}
          </Button>
          <Button appearance="text" onClick={() => data.onDelete(id)}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
        </Track>
      </Box>

      {data.stepType === "input" ? (
        <>
          {/* <Handle
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
          /> */}
        </>
      ) : (
        <Handle
          id={`handle-${id}-1`}
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </div>
  ) : (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <Track direction="horizontal" gap={4} align="left">
        <StepNode data={data} />
        <Button appearance="text">
          <Icon icon={<MdOutlineEdit />} size="medium" />
          {t("overview.edit")}
        </Button>
        <Button appearance="text" onClick={() => data.onDelete(id)}>
          <Icon icon={<MdDeleteOutline />} size="medium" />
          {t("overview.delete")}
        </Button>
      </Track>

      {data.stepType === "input" ? (
        <>
          {/* <Handle
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
          /> */}
        </>
      ) : (
        <Handle
          id={`handle-${id}-1`}
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </>
  );
};

export default CustomNode;
