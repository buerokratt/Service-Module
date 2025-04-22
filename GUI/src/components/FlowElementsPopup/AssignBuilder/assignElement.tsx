import React, { useState } from "react";
import { DragInput, FormInput, Icon, Tooltip, Track } from "components";
import { MdDeleteOutline, MdEdit, MdMoveDown } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";
import { stringToTemplate, templateToString } from "utils/string-util";
import { isArray, isObject } from "utils/object-util";
import { t } from "i18next";

interface AssignElementProps {
  element: Assign;
  onRemove: (id: string) => void;
  onChange: (element: Assign) => void;
}

const AssignElement: React.FC<AssignElementProps> = ({ element, onRemove, onChange }) => {
  const slots = element.slots ?? [];
  const [isSecondSlotOpen, setIsSecondSlotOpen] = useState(!!slots[1]);
  const [isEditingManually, setIsEditingManually] = useState(element.value && !slots.length);

  const changeKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, value: e.target.value });
  };

  const changeFirstSlot = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  const resetSecondSlot = () => {
    if (!slots[0]) return;
    onChange({ ...element, value: slots[0].value, slots: [slots[0]] });
  };

  // todo - handle VALUE
  const changeSecondSlot = (data: Assign) => {
    const value = stringToTemplate(templateToString(element.value) + '["' + templateToString(data.value) + '"]');
    console.log("old value", element.value);
    console.log("new value", data.value);
    console.log("PROCESSED value", value);
    onChange({ ...element, value, slots: [slots[0]!, data] });
  };

  const enableManualEdit = () => {
    setIsEditingManually(true);
    onChange({ ...element, slots: undefined });
  };

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
              <Tooltip
                content={t(
                  isSecondSlotOpen ? "serviceFlow.popup.removeValueAssignment" : "serviceFlow.popup.assignAsValue"
                )}
              >
                <button
                  onClick={() => {
                    setIsSecondSlotOpen(!isSecondSlotOpen);
                    if (!isSecondSlotOpen) resetSecondSlot();
                  }}
                  className={`small-assign-button ${isSecondSlotOpen ? "assign-red" : "assign-blue"}`}
                >
                  <Icon icon={<MdMoveDown />} />
                </button>
              </Tooltip>
            ) : null}
            {isSecondSlotOpen ? (
              <DragInput disallowedId={element.id} element={slots[1]} onChange={(value) => changeSecondSlot(value)} />
            ) : null}
          </Track>
        )}
        {!isEditingManually ? (
          <Tooltip content={t("serviceFlow.popup.assignManualEdit")}>
            <button onClick={enableManualEdit} className="small-assign-button assign-blue">
              <Icon icon={<MdEdit />} />
            </button>
          </Tooltip>
        ) : null}
        <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
          <Icon icon={<MdDeleteOutline />} />
        </button>
      </Track>
    </Track>
  );
};

export default AssignElement;
