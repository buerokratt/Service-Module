import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Icon, Track } from "components";
import { FC } from "react";
import { MdDragIndicator } from "react-icons/md";
import { Step, StepType } from "types";
import { onDragStart } from "utils/component-util";

interface StepElementProps {
  readonly step: Step;
  readonly activeStep?: Step | null;
}

const StepElement: FC<StepElementProps> = ({ step, activeStep }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id, data: { step } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: "grab",
    opacity: step.id === activeStep?.id ? 0 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <Box
        {...attributes}
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
        onDragStart={(event) => onDragStart(event, step)}
        draggable
      >
        <Track gap={5} align={"center"}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "move",
            }}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon={<MdDragIndicator size={16} />} size="medium" />
          </button>
          {step.label}
        </Track>
      </Box>
    </div>
  );
};

export default StepElement;
