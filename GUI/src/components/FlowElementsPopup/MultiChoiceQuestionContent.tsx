import { useState, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormTextarea, FormInput } from "../FormElements";
import Track from "../Track";
import Button from "../Button";
import Icon from "../Icon";
import { MdEdit, MdDeleteOutline, MdCheck } from "react-icons/md";

// todo extract somewhere else
const MAX_BUTTONS = 4;
// todo disable save if 2 btn only

// todo - Mati buttons UI
export interface MultiChoiceQuestionContentProps {
  question: string;
  buttons: { title: string; payload: string }[];
  setQuestion: (q: string) => void;
  setButtons: (b: { title: string; payload: string }[]) => void;
}

// todo button text languages - including default values

const MultiChoiceQuestionContent: FC<MultiChoiceQuestionContentProps> = ({
  question,
  buttons,
  setQuestion,
  setButtons,
}) => {
  const { t } = useTranslation();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(buttons[idx].title);
  };

  const handleEditSave = (idx: number) => {
    const newButtons = [...buttons];
    newButtons[idx] = { ...newButtons[idx], title: editValue };
    setButtons(newButtons);
    setEditIndex(null);
    setEditValue("");
  };

  const handleDelete = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setButtons([...buttons, { title: "", payload: "" }]);
  };

  return (
    <Track direction="vertical" align="stretch" gap={16} style={{ width: "100%", padding: 16 }}>
      <FormTextarea
        name="multiChoiceQuestion-question"
        label=""
        placeholder={t("serviceFlow.multiChoiceQuestion.questionPlaceholder")!}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxRows={3}
        minRows={2}
        hideLabel
      />
      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 500 }}>{t("serviceFlow.multiChoiceQuestion.userChoices")}</label>
        <Track direction="vertical" gap={8} style={{ marginTop: 8 }}>
          {buttons.map((btn, idx) => (
            <Track key={idx} gap={8} align="center" style={{ width: "100%" }}>
              {editIndex === idx ? (
                <>
                  <FormInput
                    name={`button-title-${idx}`}
                    label=""
                    placeholder={t("serviceFlow.multiChoiceQuestion.ellipsis")!}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(idx);
                      if (e.key === "Escape") setEditIndex(null);
                    }}
                    style={{ minWidth: 120, flex: 1 }}
                    hideLabel
                  />
                  <Button appearance="icon" size="s" onClick={() => handleEditSave(idx)} aria-label={t("global.save")!}>
                    <Icon icon={<MdCheck />} size="medium" />
                  </Button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      minWidth: 120,
                      flex: 1,
                    }}
                  >
                    <Button
                    // disabled
                    >
                      {btn.title || t("serviceFlow.multiChoiceQuestion.ellipsis")}
                    </Button>
                  </div>
                  <Button
                    appearance="icon"
                    size="s"
                    onClick={() => handleEdit(idx)}
                    aria-label={t("serviceFlow.multiChoiceQuestion.edit")!}
                  >
                    <Icon icon={<MdEdit />} size="medium" />
                  </Button>
                  <Button
                    appearance="icon"
                    size="s"
                    onClick={() => handleDelete(idx)}
                    aria-label={t("serviceFlow.multiChoiceQuestion.delete")!}
                  >
                    <Icon icon={<MdDeleteOutline />} size="medium" />
                  </Button>
                </>
              )}
            </Track>
          ))}
        </Track>
        <Track gap={8} style={{ marginTop: 12 }}>
          <Button
            appearance="secondary"
            onClick={handleAdd}
            disabled={buttons.length >= MAX_BUTTONS}
            aria-label={t("serviceFlow.multiChoiceQuestion.addButton")!}
          >
            {t("serviceFlow.multiChoiceQuestion.addButton")}
          </Button>
          {/* todo hardcoded value of 4 */}
          {buttons.length >= MAX_BUTTONS && (
            <span style={{ color: "#9799A4", fontSize: 13 }}>{t("serviceFlow.multiChoiceQuestion.maxButtons")}</span>
          )}
        </Track>
      </div>
    </Track>
  );
};

export default MultiChoiceQuestionContent;
