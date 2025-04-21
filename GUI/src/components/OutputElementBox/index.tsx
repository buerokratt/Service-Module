import { CSSProperties, FC } from "react";
import Box from "../Box";
import { AssignSlot, StepType } from "types";
import useServiceStore from "store/new-services.store";

type OutputElementBoxProps = {
  readonly text: string;
  readonly value?: string | number;
  readonly color?: "green" | "yellow";
  readonly borderColor?: string;
  readonly dragData?: AssignSlot;
  readonly useValue?: boolean;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
};

const OutputElementBox: FC<OutputElementBoxProps> = ({
  text,
  color = "green",
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

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const dragValue = useValue ? `${value}` : text;

    event.dataTransfer.setData(
      "text/plain",
      node?.data.stepType === StepType.Assign && dragData ? JSON.stringify(dragData) : dragValue
    );
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      color={color}
      draggable={!!dragData}
      onDragStart={handleDragStart}
      style={mergedStyle}
    >
      {text}
    </Box>
  );
};

export default OutputElementBox;
