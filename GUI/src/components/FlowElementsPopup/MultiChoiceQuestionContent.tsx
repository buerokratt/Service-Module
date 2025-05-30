import { useState, FC } from "react";
import { useTranslation } from "react-i18next";
import { FormTextarea, FormInput } from "../FormElements";
import Track from "../Track";
import Button from "../Button";
import Icon from "../Icon";
import { MdEdit, MdDeleteOutline, MdCheck } from "react-icons/md";
import "./styles.scss";
import FormError from "components/FormElements/FormError";

const maxButtons = parseInt(process.env.REACT_APP_MULTI_CHOICE_QUESTION_MAX_BUTTONS || "4");

export interface MultiChoiceQuestionContentProps {
  question: string;
  buttons: { title: string; payload: string }[];
  setQuestion: (q: string) => void;
  setButtons: (b: { title: string; payload: string }[]) => void;
}

const MultiChoiceQuestionContent: FC<MultiChoiceQuestionContentProps> = ({
  question,
  buttons,
  setQuestion,
  setButtons,
}) => {
  const { t } = useTranslation();
  const [hasQuestionError, setHasQuestionError] = useState(false);
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
    if (editIndex === idx) {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const handleAdd = () => {
    setButtons([...buttons, { title: "", payload: "" }]);
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
            if (e.target.value.length) setHasQuestionError(false);
          }}
          maxRows={3}
          minRows={2}
          hideLabel
          onBlur={() => setHasQuestionError(!question.length)}
        />
        {hasQuestionError && <FormError>{t("serviceFlow.multiChoiceQuestion.questionError")}</FormError>}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 500 }}>{t("serviceFlow.multiChoiceQuestion.userChoices")}</div>
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
          <FormError>
            {t("serviceFlow.multiChoiceQuestion.maxButtonsStart")}
            {maxButtons}
            {t("serviceFlow.multiChoiceQuestion.maxButtonsEnd")}
          </FormError>
        )}
      </div>
    </Track>
  );
};

export default MultiChoiceQuestionContent;
