import { t } from "i18next";
import { FormRichText, OutputElementBox, Track } from "..";
import { CSSProperties, FC } from "react";
import useServiceStore from "store/new-services.store";

type TextfieldContentProps = {
  readonly defaultMessage?: string;
  readonly onChange?: (message: string | null, placeholders: { [key: string]: string }) => void;
};

const TextfieldContent: FC<TextfieldContentProps> = ({ defaultMessage, onChange }) => {
  const variables = useServiceStore(state => state.getFlatVariables());

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  const findMessagePlaceholders = (text: string | null): { [key: string]: string } => {
    if (!text) return {};

    const pattern = /\{\{(.+?)\}\}/g;
    const placeholders: { [key: string]: string } = {};
    let match;

    while ((match = pattern.exec(text))) placeholders[match[0]] = "";
    return placeholders;
  };

  return (
    <>
      <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss }}>
        <label htmlFor="message">{t("serviceFlow.popup.messageLabel")}</label>
        <FormRichText
          onChange={(value) => {
            if (!onChange) return;
            const placeholders = findMessagePlaceholders(value);
            onChange(value, placeholders);
          }}
          defaultValue={defaultMessage}
        ></FormRichText>
      </Track>
      <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}>
        <label htmlFor="json">{t("serviceFlow.popup.availableOutputElementsLabel")}</label>
        <Track direction="horizontal" gap={4} justify="start" isMultiline={true}>
          {variables.map((element, i) => (
            <OutputElementBox key={`${element}-${i}`} text={element}></OutputElementBox>
          ))}
        </Track>
      </Track>
    </>
  );
};

export default TextfieldContent;
