import React, { useState } from "react";
import { DragInput, FormInput, Icon, Tooltip, Track } from "components";
import { MdDataObject, MdDeleteOutline, MdEdit, MdMoveDown } from "react-icons/md";
import { Assign } from "../../../types/assign";
import "../styles.scss";
import { stringToTemplate, templateToString } from "utils/string-util";
import { isArray, isObject } from "utils/object-util";
import { t } from "i18next";
import { getDragData } from "utils/component-util";
import ObjectEditor from "./ObjectEditor";
import styles from "./AssignElement.module.scss";

interface AssignElementProps {
  element: Assign;
  onRemove?: (id: string) => void;
  onChange: (element: Assign) => void;
  manualEdit?: boolean;
  isKeyEditable?: boolean;
  keyStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

const AssignElement: React.FC<AssignElementProps> = ({
  element,
  onRemove,
  onChange,
  manualEdit = false,
  isKeyEditable,
  keyStyle,
  valueStyle,
}) => {
  const slots = element.slots ?? [];
  const [isSecondSlotOpen, setIsSecondSlotOpen] = useState(!!slots[1]);
  const [isEditingManually, setIsEditingManually] = useState(manualEdit || (element.value && !slots.length));
  const [isObjectEditorOpen, setIsObjectEditorOpen] = useState(false);

  const changeKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, key: e.target.value });
  };

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...element, value: e.target.value });
  };

  const changeManualInputValue = (e: React.DragEvent<HTMLInputElement>) => {
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
    <div className={styles.assignElement}>
      <Track gap={16} isFlex>
        <FormInput
          value={element.key}
          name="key"
          disabled={isKeyEditable === false}
          onChange={changeKey}
          onDrop={(e) => e.preventDefault()}
          style={keyStyle}
          label=""
          hideLabel
        />
        :
        <Track style={{ flex: "1 0 75%", justifyContent: "flex-end" }} gap={5}>
          {!isObjectEditorOpen && (
            <>
              {isEditingManually ? (
                <FormInput
                  value={element.value}
                  name="value"
                  onChange={changeValue}
                  label=""
                  style={valueStyle}
                  hideLabel
                  onDrop={changeManualInputValue}
                />
              ) : (
                <Track gap={3} isFlex>
                  <DragInput id={element.id} element={slots[0]} onChange={changeFirstSlot} />

                  {slots.length && isObject(slots[0].data) && !isArray(slots[0].data) ? (
                    <Tooltip
                      content={t(
                        isSecondSlotOpen
                          ? "serviceFlow.popup.removeValueAssignment"
                          : "serviceFlow.popup.assignAsValue",
                      )}
                      onButtonClick={() => {
                        setIsSecondSlotOpen(!isSecondSlotOpen);
                        if (!isSecondSlotOpen) resetSecondSlot();
                      }}
                    >
                      <div className={`small-assign-button ${isSecondSlotOpen ? "assign-red" : "assign-blue"}`}>
                        <Icon icon={<MdMoveDown />} />
                      </div>
                    </Tooltip>
                  ) : null}

                  {isSecondSlotOpen ? (
                    <DragInput id={element.id} element={slots[1]} onChange={changeSecondSlot} />
                  ) : null}
                </Track>
              )}

              {!isEditingManually ? (
                <Tooltip content={t("serviceFlow.popup.assignManualEdit")} onButtonClick={enableManualEdit}>
                  <div className="small-assign-button assign-blue">
                    <Icon icon={<MdEdit />} />
                  </div>
                </Tooltip>
              ) : null}
            </>
          )}

          <button
            className="small-assign-button assign-blue"
            onClick={() => {
              setIsObjectEditorOpen(!isObjectEditorOpen);
              if (isObjectEditorOpen) setIsEditingManually(true);
            }}
          >
            <Icon icon={<MdDataObject />} />
          </button>

          {onRemove && (
            <button onClick={() => onRemove(element.id)} className="small-assign-button assign-red">
              <Icon icon={<MdDeleteOutline />} />
            </button>
          )}
        </Track>
      </Track>

      {isObjectEditorOpen && (
        <ObjectEditor
          data={element.value ? JSON.parse(templateToString(element.value)) : {}}
          onChange={(value) => onChange({ ...element, value })}
        />
      )}
    </div>
  );
};

export default AssignElement;
