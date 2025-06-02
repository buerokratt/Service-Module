import { useState, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormTextarea, FormInput } from "../FormElements";
import Track from "../Track";
import Button from "../Button";
import Icon from "../Icon";
import { MdEdit, MdDeleteOutline, MdCheck } from "react-icons/md";
import "./styles.scss";
import FormError from "components/FormElements/FormError";
import { v4 } from "uuid";

const maxButtons = parseInt(process.env.REACT_APP_MULTI_CHOICE_QUESTION_MAX_BUTTONS ?? "4");

export interface MultiChoiceQuestionContentProps {
  question: string;
  buttons: { title: string; payload: string }[];
  setQuestion: (q: string) => void;
  setButtons: (b: { title: string; payload: string }[]) => void;
  setIsSaveEnabled: (b: boolean) => void;
}

const MultiChoiceQuestionContent: FC<MultiChoiceQuestionContentProps> = ({
  question,
  buttons,
  setQuestion,
  setButtons,
  setIsSaveEnabled,
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
    const newButtons = buttons.filter((_, i) => i !== idx);
    setButtons(newButtons);
    if (editIndex === idx) {
      setEditIndex(null);
      setEditValue("");
    }
    setIsSaveEnabled(newButtons.length > 1 && !!question.length);
  };

  const handleAdd = () => {
    const newButtons = [...buttons, { title: "", payload: "" }];
    setButtons(newButtons);
    setIsSaveEnabled(newButtons.length > 1 && !!question.length);
  };

  return (
    <Track direction="vertical" align="stretch" style={{ width: "100%", padding: 16 }}>
      <div>
        <FormTextarea
          name="multiChoiceQuestion-question"
          label=""
          placeholder={t("serviceFlow.multiChoiceQuestion.questionPlaceholder")!}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setIsSaveEnabled(buttons.length > 1 && !!e.target.value.length);
          }}
          style={{ resize: "none", width: "100%" }}
          maxRows={5}
          minRows={2}
          hideLabel
        />
        {!question.length && (
          <FormError style={{ marginTop: 2 }}>{t("serviceFlow.multiChoiceQuestion.questionError")}</FormError>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 500 }}>{t("serviceFlow.multiChoiceQuestion.userChoices")}</div>
        <Track direction="vertical" gap={8} style={{ marginTop: 8 }}>
          {buttons.map((btn, idx) => (
            <Track key={v4()} gap={8} align="center" style={{ width: "100%" }}>
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
                    <Button disabled className="multiple-choice-question-button">
                      {btn.title.length > 0 ? btn.title : t("serviceFlow.multiChoiceQuestion.ellipsis")}
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
                </>
              )}
              <Button
                appearance="icon"
                size="s"
                onClick={() => handleDelete(idx)}
                aria-label={t("serviceFlow.multiChoiceQuestion.delete")!}
              >
                <Icon icon={<MdDeleteOutline />} size="medium" />
              </Button>
            </Track>
          ))}
        </Track>
        <Track gap={8} style={{ marginTop: 12 }}>
          <Button
            appearance="secondary"
            onClick={handleAdd}
            disabled={buttons.length >= maxButtons}
            aria-label={t("serviceFlow.multiChoiceQuestion.addButton")!}
          >
            {t("serviceFlow.multiChoiceQuestion.addButton")}
          </Button>
        </Track>
        {buttons.length >= maxButtons && (
          <FormError style={{ marginTop: 2 }}>
            {t("serviceFlow.multiChoiceQuestion.maxButtonsStart")}
            {maxButtons}
            {t("serviceFlow.multiChoiceQuestion.maxButtonsEnd")}
          </FormError>
        )}
        {buttons.length < 2 && (
          <FormError style={{ marginTop: 2 }}>{t("serviceFlow.multiChoiceQuestion.minButtons")}</FormError>
        )}
      </div>
    </Track>
  );
};

export default MultiChoiceQuestionContent;
