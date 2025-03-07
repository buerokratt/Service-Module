import React from "react";
import { FormInput, Icon, Track } from "components";
import { MdDeleteOutline } from "react-icons/md";
import { Assign } from "./assign-types";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    change(e.target.name, e.target.value);
  };

  const change = (name: string, value?: string) => {
    onChange({ ...element, [name]: value });
  };

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        <FormInput value={element.key} name="key" onChange={handleChange} label="" hideLabel />
        :
        <FormInput value={element.value} name="value" onChange={handleChange} label="" hideLabel />
      </Track>
      <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
        <Icon icon={<MdDeleteOutline />} />
      </button>
    </Track>
  );
};

export default AssignElement;
