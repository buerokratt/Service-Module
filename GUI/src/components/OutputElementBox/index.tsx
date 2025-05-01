import { CSSProperties, FC, DragEvent, ReactNode } from "react";
import Box from "../Box";
import { Assign, StepType } from "types";
import useServiceStore from "store/new-services.store";
import { ASSIGN_DRAG_TYPE } from "utils/component-util";

type OutputElementBoxProps = {
  readonly children: ReactNode;
  readonly borderColor?: string;
  readonly dragData?: Assign;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
};

const OutputElementBox: FC<OutputElementBoxProps> = ({
  borderColor,
  dragData,
  onClick,
  style,
  className,
  children,
}) => {
  const node = useServiceStore((state) => state.selectedNode);
  const mergedStyle: CSSProperties = {
    borderRadius: 46,
    paddingTop: 1.5,
    paddingBottom: 1.5,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    ...style,
    ...(borderColor && { border: `2px outset ${borderColor}` }),
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!dragData) return;

    event.dataTransfer.setData(
      ASSIGN_DRAG_TYPE,
      // Need to check for StepType.Assign here since ReactQuill does not support custom onDrop events
      node?.data.stepType === StepType.Assign ? JSON.stringify(dragData) : dragData.value
    );
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      color="green"
      draggable={!!dragData}
      onDragStart={handleDragStart}
      style={mergedStyle}
    >
      {children}
    </Box>
  );
};

export default OutputElementBox;
