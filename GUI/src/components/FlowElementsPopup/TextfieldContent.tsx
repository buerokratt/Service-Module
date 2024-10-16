import { t, use } from "i18next";
import { FormRichText, OutputElementBox, Track } from "..";
import { CSSProperties, FC, useEffect, useState } from "react";
import useServiceStore from "store/new-services.store";

type TextfieldContentProps = {
  readonly defaultMessage?: string;
  readonly onChange?: (message: string | null, placeholders: { [key: string]: string }) => void;
};

const TextfieldContent: FC<TextfieldContentProps> = ({ defaultMessage, onChange }) => {
  const variables = useServiceStore((state) => state.getFlatVariables());
  const endpointsVariables = useServiceStore((state) => state.endpointsResponseVariables);

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
      {endpointsVariables.map((endpoint) => (
        <Track direction="vertical" align="left" style={{ width: "100%", ...popupBodyCss, backgroundColor: "#F9F9F9" }}>
          <label htmlFor="json" style={{ marginBottom: "10px", textTransform: "capitalize", cursor: "auto" }}>{`${endpoint.name}`}</label>
          <Track direction="horizontal" gap={4} justify="start" isMultiline style={{ maxHeight: "30vh", overflow: "auto" }}>
            {endpoint.chips.map((chip) => (
              <OutputElementBox key={chip.value} text={chip.name} draggable={true} value={chip.value} useValue></OutputElementBox>
            ))}
          </Track>
        </Track>
      ))}
    </>
  );
};

export default TextfieldContent;
