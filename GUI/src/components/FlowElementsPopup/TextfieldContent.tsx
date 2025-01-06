import { t } from "i18next";
import { FormRichText, Track } from "..";
import { CSSProperties, FC } from "react";
import PreviousVariables from "./PreviousVariables";

type TextfieldContentProps = {
  readonly defaultMessage?: string;
  readonly nodeId: string;
  readonly onChange?: (message: string | null, placeholders: { [key: string]: string }) => void;
};

const TextfieldContent: FC<TextfieldContentProps> = ({ defaultMessage, onChange, nodeId }) => {
  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  const findMessagePlaceholders = (text: string | null): { [key: string]: string } => {
    if (!text) return {};

    const pattern = /\{\{(.{1,512}?)\}\}/g;
    const placeholders: { [key: string]: string } = {};
    let match;

    while ((match = pattern.exec(text))) placeholders[match[0]] = "";
    return placeholders;
  };

  return (
    <>
      <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss }}>
        <label htmlFor="message" style={{ marginBottom: "10px" }}>
          {t("serviceFlow.popup.messageLabel")}
        </label>
        <FormRichText
          onChange={(value) => {
            if (!onChange) return;
            const placeholders = findMessagePlaceholders(value);
            onChange(value, placeholders);
          }}
          defaultValue={defaultMessage}
        ></FormRichText>
      </Track>
      <PreviousVariables nodeId={nodeId} />
    </>
  );
};

export default TextfieldContent;
