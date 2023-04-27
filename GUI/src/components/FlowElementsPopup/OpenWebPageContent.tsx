import { t } from "i18next";
import { FormInput } from "../FormElements";
import Track from "../Track";
import { FC } from "react";

type OpenWebPageContentProps = {
  readonly onWebpageNameChange: (name: string) => void;
  readonly onWebpageUrlChange: (name: string) => void;
}

const OpenWebPageContent: FC<OpenWebPageContentProps> = ({ onWebpageNameChange, onWebpageUrlChange }) => {
  return (
    <>
      <Track direction="vertical" gap={16} style={{ padding: 16 }}>
        <Track direction="vertical" align="left" style={{ width: '100%' }}>
          <label htmlFor="json">{t('serviceFlow.popup.openWebpageLabel')}</label>
          <FormInput
            name={"web-page"}
            label={"web-page"}
            onChange={(event) => onWebpageNameChange(event.target.value)}
            hideLabel
          ></FormInput>
        </Track>
        <Track direction="vertical" align="left" style={{ width: '100%' }}>
          <label htmlFor="web-page-url">URL</label>
          <FormInput
            name={"web-page-url"}
            label={"web-page-url"}
            placeholder="https://"
            onChange={(event) => onWebpageUrlChange(event.target.value)}
            hideLabel
          ></FormInput>
        </Track>
      </Track>
    </>
  );
}

export default OpenWebPageContent;
