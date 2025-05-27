import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button } from "components";
import { FC } from "react";
import { Step, StepType } from "types";
import { onDragStart } from "utils/component-util";

interface UserItemProps {
  step: Step;
}
const UserItem: FC<UserItemProps> = (props) => {
  const { id, type, label } = props.step;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    //   className="bg-blue-200 p-4 rounded shadow-md flex justify-between"
    >
      {/* <Button >{label}</Button> */}
      <Box
        key={id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(type) ? "red" : "blue"}
        // onDragStart={(event) => onDragStart(event, props.step)}
        // draggable
      >
        {label}
      </Box>
    </div>
  );
};

export default UserItem;
