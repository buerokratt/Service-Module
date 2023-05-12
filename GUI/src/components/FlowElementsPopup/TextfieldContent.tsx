import { t } from "i18next";
import { FormRichText, OutputElementBox, Track } from "..";
import { CSSProperties, FC } from "react";
import { Node } from "reactflow";
import { PreDefinedEndpointEnvVariables } from "../../types/endpoint";

type TextfieldContentProps = {
  readonly availableVariables?: PreDefinedEndpointEnvVariables;
  readonly defaultMessage?: string;
  readonly onChange?: (message: string | null, placeholders: { [key: string]: string }) => void;
};

const TextfieldContent: FC<TextfieldContentProps> = ({ availableVariables, defaultMessage, onChange }) => {
  const availableOutputElements = [...(availableVariables?.prod ?? []), ...(availableVariables?.test ?? [])];

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
          {availableOutputElements.map((element, i) => (
            <OutputElementBox key={`${element}-${i}`} text={element}></OutputElementBox>
          ))}
        </Track>
      </Track>
    </>
  );
};

export default TextfieldContent;
