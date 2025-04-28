import { CSSProperties, FC, DragEvent, ReactNode } from "react";
import Box from "../Box";
import { Assign, StepType } from "types";
import useServiceStore from "store/new-services.store";

type OutputElementBoxProps = {
  readonly children: ReactNode;
  readonly value?: string | number;
  readonly borderColor?: string;
  readonly dragData?: Assign;
  readonly useValue?: boolean;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
};

const OutputElementBox: FC<OutputElementBoxProps> = ({
  borderColor,
  dragData,
  useValue = false,
  value = "",
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
    // todo string children? other places?
    const dragValue = useValue ? `${value}` : String(children);

    event.dataTransfer.setData(
      "text/plain",
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
      {children}
    </Box>
  );
};

export default OutputElementBox;
