import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Icon, Track } from "components";
import { FC } from "react";
import { MdOutlinePin, MdPin } from "react-icons/md";
import useServiceStore from "store/new-services.store";
import { Step, StepType } from "types";
import { onDragStart } from "utils/component-util";

interface StepElementProps {
  readonly step: Step;
}

const StepElement: FC<StepElementProps> = ({ step }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id, data: { step } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style}>
      <Box
        {...listeners}
        {...attributes}
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? "red" : "blue"}
        onDragStart={(event) => onDragStart(event, step)}
        draggable
      >
        <Track align="center" justify="between" style={{ height: "27px" }}>
          {step.label}
          <Button appearance="text" onClick={() => {}}>
            <Icon icon={step.pinned ? <MdPin /> : <MdOutlinePin />} size="medium" />
          </Button>
        </Track>
      </Box>
    </div>
  );
};

export default StepElement;
