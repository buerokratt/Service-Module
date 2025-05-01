import React, { useState } from "react";
import { DragInput, FormInput, Icon, Tooltip, Track } from "components";
import { MdDeleteOutline, MdEdit, MdMoveDown } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";
import { stringToTemplate, templateToString } from "utils/string-util";
import { isArray, isObject } from "utils/object-util";
import { t } from "i18next";
import { getDragData } from "utils/component-util";

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

  const changeManualInputValue = (e: React.DragEvent<HTMLInputElement>) => {
    console.log("changeManualInputValue", e);
    const data = getDragData(e);
    onChange({ ...element, value: data.value });
  };

  const changeFirstSlot = (data: Assign) => {
    onChange({ ...element, value: data.value, slots: [data] });
  };

  const resetSecondSlot = () => {
    if (!slots[0]) return;

    onChange({ ...element, value: slots[0].value, slots: [slots[0]] });
  };

  const changeSecondSlot = (data: Assign) => {
    if (!slots[0]) return;

    const elementValueContent = templateToString(element.value);
    const dataValueContent = templateToString(data.value);
    const value = stringToTemplate(`${elementValueContent}[${dataValueContent}]`);

    onChange({ ...element, value, slots: [slots[0], data] });
  };

  const enableManualEdit = () => {
    setIsEditingManually(true);
    onChange({ ...element, slots: undefined });
  };

  return (
    <Track gap={16} isFlex>
      <FormInput
        value={element.key}
        name="key"
        onChange={changeKey}
        label=""
        hideLabel
        onDrop={(e) => e.preventDefault()}
      />
      :
      <Track style={{ flex: "1 0 75%", justifyContent: "flex-end" }}>
        {isEditingManually ? (
          <FormInput
            value={element.value}
            name="value"
            onChange={changeValue}
            label=""
            hideLabel
            onDrop={(e) => {
              console.log("onDrop", e);
              changeManualInputValue(e);
            }}
          />
        ) : (
          <Track gap={3} isFlex>
            <DragInput disallowedId={element.id} element={slots[0]} onChange={changeFirstSlot} />

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
              <DragInput disallowedId={element.id} element={slots[1]} onChange={changeSecondSlot} />
            ) : null}
          </Track>
        )}

        {!isEditingManually ? (
          <Tooltip content={t("serviceFlow.popup.assignManualEdit")}>
            <div onClick={enableManualEdit} className="small-assign-button assign-blue">
              <Icon icon={<MdEdit />} />
            </div>
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
