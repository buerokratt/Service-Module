import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { Handle, NodeProps, Position, useUpdateNodeInternals } from "@xyflow/react";
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from "react-icons/md";
import StepNode from "./StepNode";
import "./Node.scss";
import { StepType } from "types";
import Button from "components/Button";
import Icon from "components/Icon";
import Track from "components/Track";

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
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
  const { data, isConnectable, id } = props;
  const shouldOffsetHandles = data.childrenCount > 1;

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.childrenCount]);

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
            style={
              shouldOffsetHandles
                ? {
                    left: `${(100 / (data.childrenCount + 1)) * (i + 1)}%`,
                    visibility: isFinishingStep() ? "hidden" : "visible",
                  }
                : {}
            }
            hidden={isFinishingStep()}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <StepNode data={data} />
      {data.stepType !== "rule" && (
        <Track style={{ position: "fixed", top: 8, right: 8 }}>
          <Button
            appearance="text"
            onClick={() => {
              data.setClickedNode(id);
              data.onEdit(id);
            }}
          >
            <Icon icon={data.readonly ? <MdOutlineRemoveRedEye /> : <MdOutlineEdit />} size="medium" />
          </Button>
          <Button appearance="text" onClick={() => data.onDelete(id, true)}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
          </Button>
        </Track>
      )}
      {bottomHandles()}
    </>
  );
};

export default CustomNode;
