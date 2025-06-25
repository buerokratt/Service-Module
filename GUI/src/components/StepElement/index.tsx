import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Icon, Track } from "components";
import { FC } from "react";
import { MdDragIndicator } from "react-icons/md";
import { Step, StepType } from "types";

interface StepElementProps {
  readonly step: Step;
  onClick: (step: Step) => void;
}

const StepElement: FC<StepElementProps> = ({ step, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id, data: { step } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: "pointer",
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <Box
        {...attributes}
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
        onClick={() => onClick(step)}
        draggable={false}
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
