import React, { useState } from "react";
import { DragInput, FormInput, Icon, Track } from "components";
import { MdDeleteOutline, MdEdit, MdMoveDown } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";
import { stringToTemplate, templateToString } from "utils/string-util";
import { isArray, isObject } from "utils/object-util";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const slots = element.slots ?? [];
  const [isSecondSlotOpen, setIsSecondSlotOpen] = useState(!!slots[1]);
  const [isEditingManually, setIsEditingManually] = useState(false);

  console.log("isEditingManually CONDITION", element.value);
  console.log("isEditingManually CONDITION", slots);

  const changeKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, value: e.target.value });
  };

  const changeFirstSlot = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  // todo - handle VALUE
  const changeSecondSlot = (data: Assign) => {
    const value = stringToTemplate(templateToString(element.value) + '["' + templateToString(data.value) + '"]');
    console.log("old value", element.value);
    console.log("new value", data.value);
    console.log("PROCESSED value", value);
    onChange({ ...element, value, slots: [slots[0]!, data] });
  };

  // todo tooltips
  return (
    <Track gap={16} isFlex>
      <FormInput value={element.key} name="key" onChange={changeKey} label="" hideLabel />:
      <Track style={{ flex: "1 0 75%", justifyContent: "flex-end" }}>
        {isEditingManually ? (
          <FormInput value={element.value} name="value" onChange={changeValue} label="" hideLabel />
        ) : (
          <Track gap={3} isFlex>
            <DragInput disallowedId={element.id} element={slots[0]} onChange={(value) => changeFirstSlot(value)} />
            {slots.length && isObject(slots[0]?.data) && !isArray(slots[0]?.data) ? (
              <button
                onClick={() => {
                  setIsSecondSlotOpen(!isSecondSlotOpen);
                  // Reset second slot
                  if (!isSecondSlotOpen) onChange({ ...element, value: slots[0].value, slots: [slots[0]] });
                }}
                className={`small-assign-button ${isSecondSlotOpen ? "assign-red" : "assign-blue"}`}
              >
                <Icon icon={<MdMoveDown />} />
              </button>
            ) : null}
            {isSecondSlotOpen ? (
              <DragInput disallowedId={element.id} element={slots[1]} onChange={(value) => changeSecondSlot(value)} />
            ) : null}
          </Track>
        )}
        {!isEditingManually ? (
          <button
            onClick={() => {
              // todo broken when opening AGAIN - editing manually state is not preserved
              setIsEditingManually(true);
              onChange({ ...element, slots: undefined });
            }}
            className="small-assign-button assign-blue"
          >
            <Icon icon={<MdEdit />} />
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
