import React, { useState } from "react";
import { DragInput, FormInput, Icon, Track } from "components";
import { MdDeleteOutline, MdMoveDown } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";
import { isObject } from "utils/object-util";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const [isSecondSlotOpen, setIsSecondSlotOpen] = useState(false);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const handleValueChange = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  // todo tooltips
  return (
    <Track gap={16} isFlex>
      <FormInput value={element.key} name="key" onChange={handleKeyChange} label="" hideLabel />:
      <Track gap={4} isFlex style={{ flex: "1 0 50%", justifyContent: "flex-end" }}>
        {/* todo NAME*/}
        <DragInput
          id={element.id}
          element={element.slots?.[0]}
          name="value"
          onChange={(value) => handleValueChange(value)}
        />
        {element.slots?.length && isObject(element.slots?.[0].data) ? (
          <button onClick={() => setIsSecondSlotOpen(!isSecondSlotOpen)} className="small-assign-button assign-blue">
            <Icon icon={<MdMoveDown />} />
          </button>
        ) : null}
        <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
          <Icon icon={<MdDeleteOutline />} />
        </button>
      </Track>
    </Track>
  );
};

export default AssignElement;
