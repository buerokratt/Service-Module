import React from "react";
import { FormInput } from "../FormElements";
import { OutputElementBox, Track } from "..";
import FormRichText from "../FormElements/FormRichText";
import "./styles.scss";

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
  const availableOutputVariables = ["{{abc123}}", "{{abc124}}", "{{abc125}}"];

  return (
    <Track direction="vertical" align="stretch">
      <Track gap={16} className="flow-body-padding">
        <label className="flow-body-label">
          <Track gap={8} direction="vertical" align="left">
            File Name
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
        <span>File contents</span>
        <FormRichText
          defaultValue={defaultFileContent}
          onChange={(v) => {
            if (v) onFileContentChange(v);
          }}
        />
      </Track>

      <Track direction="vertical" align="left" gap={16} className="popup-top-border-track">
        <span>The client sees the message</span>
        <Track align="left" className="popup-client-text-demo">
          text + file name
        </Track>
      </Track>

      <Track direction="vertical" align="left" gap={16} className="popup-top-border-track popup-darker-track">
        <span>Available Output Variables</span>
        <Track gap={7} className="flow-tags-container">
          {availableOutputVariables.map((element, i) => (
            <OutputElementBox key={`${element}-${i}`} text={element}></OutputElementBox>
          ))}
        </Track>
      </Track>
    </Track>
  );
};

export default FileGenerateContent;
