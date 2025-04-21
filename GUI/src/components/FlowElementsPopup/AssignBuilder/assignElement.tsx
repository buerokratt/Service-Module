import React from "react";
import { DragInput, FormInput, Icon, Track } from "components";
import { MdDeleteOutline } from "react-icons/md";
import { Assign } from "./assign-types";
import "../styles.scss";
import { t } from "i18next";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const handleValueChange = (value: string) => {
    onChange({ ...element, value });
  };

  return (
    <Track gap={16} isFlex>
      <Track gap={16} isFlex>
        <FormInput value={element.key} name="key" onChange={handleKeyChange} label="" hideLabel />
        {/* todo resets to value after save */}
        <DragInput
          value={element.value}
          name="value"
          onChange={(value) => handleValueChange(value)}
          placeholder={t("serviceFlow.popup.dragElementHere")!}
        />
      </Track>
      <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
        <Icon icon={<MdDeleteOutline />} />
      </button>
    </Track>
  );
};

export default AssignElement;
