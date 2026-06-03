import { Node } from '@xyflow/react';
import { t } from 'i18next';
import { CSSProperties, FC, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { NodeDataProps } from 'types/service-flow';

import { FormRichText, Track } from '..';
import PreviousVariables from './PreviousVariables';

type TextfieldContentProps = {
  readonly defaultMessage?: string;
  readonly node: Node<NodeDataProps>;
  readonly onChange?: (message: string | null, placeholders: { [key: string]: string }) => void;
};

const TextfieldContent: FC<TextfieldContentProps> = ({ defaultMessage, onChange, node }) => {
  const [editorValue, setEditorValue] = useState<string | null>(defaultMessage || null);
  const quillRef = useRef<ReactQuill>(null);

  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`,
  };

  const findMessagePlaceholders = (text: string | null): { [key: string]: string } => {
    if (!text) return {};

    const pattern = /\{\{(.{1,512}?)\}\}/g;
    const placeholders: { [key: string]: string } = {};
    let match;

    while ((match = pattern.exec(text))) placeholders[match[0]] = '';
    return placeholders;
  };

  const handleEditorChange = (value: string | null) => {
    if (!onChange) return;

    const placeholders = findMessagePlaceholders(value ?? '');
    onChange(value, placeholders);
    setEditorValue(value);
  };

  return (
    <>
      <Track direction="vertical" align="left" style={{ width: '100%', ...popupBodyCss }}>
        <label htmlFor="message" style={{ marginBottom: '10px' }}>
          {t('serviceFlow.popup.messageLabel')}
        </label>
        <FormRichText quill={quillRef} onChange={handleEditorChange} defaultValue={editorValue ?? ''} />
      </Track>
      <PreviousVariables node={node} />
    </>
  );
};

export default TextfieldContent;
