import { CSSProperties, FC, DragEvent } from "react";
import Box from "../Box";
import { Assign, StepType } from "types";
import useServiceStore from "store/new-services.store";
import { ASSIGN_DRAG_TYPE } from "utils/component-util";

type OutputElementBoxProps = {
  readonly text: string;
  readonly value?: string | number;
  readonly borderColor?: string;
  readonly dragData?: Assign;
  readonly useValue?: boolean;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
};

const OutputElementBox: FC<OutputElementBoxProps> = ({
  text,
  borderColor,
  dragData,
  useValue = false,
  value = "",
  onClick,
  style,
  className,
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
    const dragValue = useValue ? `${value}` : text;

    event.dataTransfer.setData(
      ASSIGN_DRAG_TYPE,
      node?.data.stepType === StepType.Assign && dragData ? JSON.stringify(dragData) : dragValue
    );
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      color="green"
      draggable={!!dragData}
      onDragStart={dragData && handleDragStart}
      style={mergedStyle}
    >
      {text}
    </Box>
  );
};

export default OutputElementBox;
