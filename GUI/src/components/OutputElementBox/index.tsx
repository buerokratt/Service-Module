import { CSSProperties, FC, DragEvent, ReactNode } from "react";
import Box from "../Box";
import { Assign, StepType } from "types";
import useServiceStore from "store/new-services.store";

type OutputElementBoxProps = {
  readonly children: ReactNode;
  readonly borderColor?: string;
  readonly value?: Assign;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
};

const OutputElementBox: FC<OutputElementBoxProps> = ({ borderColor, value, onClick, style, className, children }) => {
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
    if (!value) return;

    event.dataTransfer.setData(
      "text/plain",
      node?.data.stepType === StepType.Assign ? JSON.stringify(value) : value.value
    );
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      color="green"
      draggable={!!value}
      onDragStart={handleDragStart}
      style={mergedStyle}
    >
      {children}
    </Box>
  );
};

export default OutputElementBox;
