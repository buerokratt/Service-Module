import React from "react";
import { DragInput, FormInput, Icon, Track } from "components";
import { MdDeleteOutline } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const handleValueChange = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        <FormInput value={element.key} name="key" onChange={handleKeyChange} label="" hideLabel />
        {/* todo NAME*/}
        <DragInput element={element.slots?.[0]} name="value" onChange={(value) => handleValueChange(value)} />
        {element.slots?.length ? <div>!!!</div> : null}
      </Track>
      <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
        <Icon icon={<MdDeleteOutline />} />
      </button>
    </Track>
  );
};

export default AssignElement;
