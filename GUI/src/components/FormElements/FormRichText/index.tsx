import { FC } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import './FormRichText.scss';

type FormRichTextProps = {
  readonly defaultValue?: string;
  onChange(value: string | null): void
}

const FormRichText: FC<FormRichTextProps> = ({ defaultValue, onChange }) => {
  const modules = {
    toolbar: [
      ['italic', 'bold', 'underline', 'strike', 'blockquote'],
      [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
    ],
  };

  return <>
    <ReactQuill
      defaultValue={defaultValue}
      onChange={(value) => {
        value = value === '<p><br></p>' ? '' : value;
        onChange(value.length === 0 ? null : value);
      }}
      modules={modules}
      style={{ width: '100%' }}
    />
  </>
}

export default FormRichText;
