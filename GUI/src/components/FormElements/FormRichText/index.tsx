import { FC, Ref, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './FormRichText.scss';

type FormRichTextProps = {
  readonly defaultValue?: string;
  quill?: Ref<ReactQuill>;
  onChange(value: string | null): void;
};

const FormRichText: FC<FormRichTextProps> = ({ defaultValue, onChange, quill }) => {
  const modules = {
    toolbar: [
      ['italic', 'bold', 'underline', 'strike', 'blockquote'],
      [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  useEffect(() => {
    if (!quill || !('current' in quill) || !quill.current) return;

    const quillInstance = quill.current.getEditor();
    const editorElement = quillInstance.root;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const selection = quillInstance.getSelection(true);
        if (selection) {
          quillInstance.insertText(selection.index, '    ', 'user');
          quillInstance.setSelection({ index: selection.index + 4, length: 0 });
        }
      }
    };

    editorElement.addEventListener('keydown', handleTabKey, true);
    return () => editorElement.removeEventListener('keydown', handleTabKey, true);
  }, [quill]);

  return (
    <ReactQuill
      ref={quill}
      defaultValue={defaultValue}
      onChange={(value) => {
        value = value === '<p><br></p>' ? '' : value;
        onChange(value.length === 0 ? null : value);
      }}
      modules={modules}
      style={{ width: '100%' }}
      preserveWhitespace
    />
  );
};

export default FormRichText;
