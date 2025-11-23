import { CSSProperties, DragEvent, forwardRef, ReactNode } from 'react';
import useServiceStore from 'store/new-services.store';
import { Assign, StepType } from 'types';
import { ASSIGN_DRAG_TYPE } from 'utils/component-util';

import Box from '../Box';

type OutputElementBoxProps = {
  readonly children: ReactNode;
  readonly borderColor?: string;
  readonly dragData?: Assign;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly className?: string;
  readonly isAssignElement?: boolean;
};

const OutputElementBox = forwardRef<HTMLDivElement, OutputElementBoxProps>(
  ({ borderColor, dragData, onClick, style, className, children, isAssignElement = false }, ref) => {
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

      const dragValue = isAssignElement ? `\${${dragData.key}}` : dragData.value;

      event.dataTransfer.setData(
        ASSIGN_DRAG_TYPE,
        // Need to check for StepType.Assign here since ReactQuill does not support custom onDrop events
        node?.data.stepType === StepType.Assign ||
          node?.data.stepType === StepType.DynamicChoices ||
          node?.data.stepType === StepType.Condition
          ? JSON.stringify(dragData)
          : dragValue,
      );
    };

    return (
      <Box
        ref={ref}
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
  },
);

OutputElementBox.displayName = 'OutputElementBox';

export default OutputElementBox;
