import React from "react";
import { FormInput } from "../FormElements";
import { Track } from "..";
import VariableAsTag from "./VariableAsTag";
import FormRichText from "../FormElements/FormRichText";
import './styles.scss'

const FileGenerateContent: React.FC = () => {

  const availableOutputVariables = ['abc123', 'abc123', 'abc123']

  return (
    <Track direction='vertical' align='stretch'>
      <Track gap={16} className='flow-body-padding'>
        <label className='flow-body-label'>
          <Track gap={8} direction='vertical' align='left'>
            File Name
            <FormInput name='' label='' defaultValue='file' />
          </Track>
        </label>
      </Track>
      <Track
        direction='vertical'
        align='left'
        gap={16}
        className="popup-top-border-track"
      >
        <span>File contents</span>
        <FormRichText onChange={(value) => { }} />
      </Track>

      <Track
        direction='vertical'
        align='left'
        gap={16}
        className="popup-top-border-track"
      >
        <span>The client sees the message</span>
        <Track align='left' className='popup-client-text-demo'>
          text + file name
        </Track>
      </Track>

      <Track
        direction='vertical'
        align='left'
        gap={16}
        className="popup-top-border-track popup-darker-track"
      >
        <span>Available Output Variables</span>
        <Track gap={7} className="flow-tags-container">
          {availableOutputVariables.map((x) => <VariableAsTag key={x} value={x} color='green' />)}
        </Track>
      </Track>
    </Track>
  )
}

export default FileGenerateContent
