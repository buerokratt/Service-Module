import React from "react";
import { FormInput } from "../FormElements";
import { OutputElementBox, Track } from "..";
import FormRichText from "../FormElements/FormRichText";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import useServiceStore from "store/new-services.store";

type FileGenerateContentProps = {
  readonly onFileNameChange: (name: string) => void;
  readonly onFileContentChange: (content: string) => void;
  readonly defaultFileName?: string;
  readonly defaultFileContent?: string;
};

const FileGenerateContent: React.FC<FileGenerateContentProps> = ({
  onFileNameChange,
  onFileContentChange,
  defaultFileName,
  defaultFileContent,
}) => {
  const { t } = useTranslation();
  const variables = useServiceStore(state => state.getFlatVariables());

  return (
    <Track direction="vertical" align="stretch">
      <Track gap={16} className="flow-body-padding">
        <label className="flow-body-label">
          <Track gap={8} direction="vertical" align="left">
            {t("serviceFlow.popup.fileName")}
            <FormInput
              name=""
              label=""
              defaultValue={defaultFileName}
              onChange={(e) => onFileNameChange(e.target.value)}
            />
          </Track>
        </label>
      </Track>
      <Track direction="vertical" align="left" gap={16} className="popup-top-border-track">
        <span>{t("serviceFlow.popup.fileContent")}</span>
        <FormRichText
          defaultValue={defaultFileContent}
          onChange={(v) => {
            if (v) onFileContentChange(v);
          }}
        />
      </Track>

      <Track direction="vertical" align="left" gap={16} className="popup-top-border-track">
        <span>{t("serviceFlow.popup.clientSeesMessage")}</span>
        <Track align="left" className="popup-client-text-demo">
          {t("serviceFlow.popup.fileClientSees")}
        </Track>
      </Track>

      <Track direction="vertical" align="left" gap={16} className="popup-top-border-track popup-darker-track">
        <span>{t("serviceFlow.popup.availableVariables")}</span>
        <Track gap={7} className="flow-tags-container">
          {variables.map((element, i) => (
            <OutputElementBox key={`${element}-${i}`} text={element}></OutputElementBox>
          ))}
        </Track>
      </Track>
    </Track>
  );
};

export default FileGenerateContent;
