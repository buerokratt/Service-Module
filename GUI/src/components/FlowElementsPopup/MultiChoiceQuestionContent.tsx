import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormTextarea, FormInput } from "../FormElements";
import Track from "../Track";
import Button from "../Button";
import Icon from "../Icon";
import { MdEdit, MdDeleteOutline, MdCheck } from "react-icons/md";
import { MultiChoiceQuestion } from "types/service-flow";

const MAX_BUTTONS = 4;

const MultiChoiceQuestionContent = () => {
  const { t } = useTranslation();

  const defaultQuestion: MultiChoiceQuestion = {
    question: "",
    buttons: [
      { title: "Yes", payload: "" },
      { title: "No", payload: "" },
    ],
  };

  const [question, setQuestion] = useState<string>(defaultQuestion.question);
  const [buttons, setButtons] = useState<{ title: string; payload: string }[]>(
    defaultQuestion.buttons.length > 0 ? defaultQuestion.buttons : []
  );
  // todo do i need this?//
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Sync with parent on change
  //   React.useEffect(() => {
  //     useServiceStore.getState().setSelectedNodeData({
  //       ...node.data,
  //       multiChoiceQuestion: {
  //         question,
  //         buttons,
  //       },
  //     });
  //     // eslint-disable-next-line
  //   }, [question, buttons]);

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditValue(buttons[idx].title);
  };

  const handleEditSave = (idx: number) => {
    const newButtons = [...buttons];
    newButtons[idx] = { ...newButtons[idx], title: editValue };
    setButtons(newButtons);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDelete = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleAdd = () => {
    if (buttons.length < MAX_BUTTONS) {
      setButtons([...buttons, { title: "", payload: "" }]);
    }
  };

  return (
    <Track direction="vertical" align="stretch" gap={16} style={{ width: "100%", padding: 16 }}>
      <label htmlFor="multiChoiceQuestion-question" style={{ marginBottom: 8 }}>
        {t("serviceFlow.popup.messageLabel")}
      </label>
      <FormTextarea
        name="multiChoiceQuestion-question"
        label=""
        placeholder={t("serviceFlow.multiChoiceQuestion.questionPlaceholder")!}
        defaultValue={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxRows={3}
        minRows={2}
        hideLabel
      />
      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 500 }}>{t("serviceFlow.popup.action")}</label>
        <Track direction="vertical" gap={8} style={{ marginTop: 8 }}>
          {buttons.map((btn, idx) => (
            <Track key={idx} gap={8} align="center" style={{ width: "100%" }}>
              {editingIndex === idx ? (
                <>
                  <FormInput
                    name={`button-title-${idx}`}
                    label=""
                    placeholder={t("serviceFlow.multiChoiceQuestion.buttonTitlePlaceholder")!}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(idx);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    style={{ minWidth: 120, flex: 1 }}
                    hideLabel
                  />
                  <Button appearance="icon" size="s" onClick={() => handleEditSave(idx)} aria-label={t("global.save")}>
                    <Icon icon={<MdCheck />} size="medium" />
                  </Button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      minWidth: 120,
                      flex: 1,
                      fontStyle: btn.title ? undefined : "italic",
                      color: btn.title ? undefined : "#9799A4",
                    }}
                  >
                    {btn.title || t("serviceFlow.multiChoiceQuestion.ellipsis")}
                  </span>
                  <>
                    <Button
                      appearance="icon"
                      size="s"
                      onClick={() => handleEdit(idx)}
                      aria-label={t("serviceFlow.multiChoiceQuestion.edit")}
                    >
                      <Icon icon={<MdEdit />} size="medium" />
                    </Button>
                    <Button
                      appearance="icon"
                      size="s"
                      onClick={() => handleDelete(idx)}
                      aria-label={t("serviceFlow.multiChoiceQuestion.delete")}
                    >
                      <Icon icon={<MdDeleteOutline />} size="medium" />
                    </Button>
                  </>
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
            aria-label={t("serviceFlow.multiChoiceQuestion.addButton")}
          >
            {t("serviceFlow.multiChoiceQuestion.addButton")}
          </Button>
          {buttons.length >= MAX_BUTTONS && (
            <span style={{ color: "#9799A4", fontSize: 13 }}>{t("serviceFlow.multiChoiceQuestion.maxButtons")}</span>
          )}
        </Track>
      </div>
    </Track>
  );
};

export default MultiChoiceQuestionContent;
