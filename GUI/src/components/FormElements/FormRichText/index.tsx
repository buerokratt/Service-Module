import { FC, Ref, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ensureAbsoluteUrl } from 'utils/string-util';
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
    uploader: false,
  };

  useEffect(() => {
    if (!quill || !('current' in quill) || !quill.current) return;

    const quillInstance = quill.current.getEditor();
    const editorElement = quillInstance.root;

    const normalizeLinks = () => {
      editorElement.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href') ?? '';
        const normalized = ensureAbsoluteUrl(href);
        if (normalized !== href) link.setAttribute('href', normalized);
      });
    };

    // Normalize on mount (existing content) and on every content change
    normalizeLinks();
    quillInstance.on('text-change', normalizeLinks);

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

    const handleDrop = (e: DragEvent) => {
      const text = e.dataTransfer?.getData('text/plain');
      if (!text) return;

      e.preventDefault();

      const docWithCaretPosition = document as Document & {
        caretPositionFromPoint?(x: number, y: number): { offsetNode: Node; offset: number } | null;
      };

      let native: Range | null = null;
      if (typeof docWithCaretPosition.caretPositionFromPoint === 'function') {
        const position = docWithCaretPosition.caretPositionFromPoint(e.clientX, e.clientY);
        if (position) {
          native = document.createRange();
          native.setStart(position.offsetNode, position.offset);
          native.setEnd(position.offsetNode, position.offset);
        }
      } else if (
        // Safari has no caretPositionFromPoint; fall back to the deprecated but still
        // supported caretRangeFromPoint.
        // eslint-disable-next-line sonarjs/deprecation
        document.caretRangeFromPoint
      ) {
        // eslint-disable-next-line sonarjs/deprecation
        native = document.caretRangeFromPoint(e.clientX, e.clientY);
      }

      const normalized = native && quillInstance.selection.normalizeNative(native);
      const range = normalized ? quillInstance.selection.normalizedToRange(normalized) : quillInstance.getSelection(true);
      if (!range) return;

      quillInstance.insertText(range.index, text, 'user');
      quillInstance.setSelection(range.index + text.length, 0, 'user');
      quillInstance.focus();
    };

    editorElement.addEventListener('drop', handleDrop);
    return () => {
      editorElement.removeEventListener('keydown', handleTabKey, true);
      editorElement.removeEventListener('drop', handleDrop);
      quillInstance.off('text-change', normalizeLinks);
    };
  }, [quill]);

  return (
    <ReactQuill
      ref={quill}
      defaultValue={defaultValue}
      modules={modules}
      style={{ width: '100%' }}
      preserveWhitespace
      onChange={(value) => {
        value = value === '<p><br></p>' ? '' : value;
        const normalized = value.replaceAll(
          /(<a\s[^>]*?)href=(["'])(?!https?:\/\/|\/\/)([^"'\s>]+)\2/gi,
          (_, pre, quote, href) => `${pre}href=${quote}https://${href}${quote}`,
        );
        onChange(normalized.length === 0 ? null : normalized);
      }}
    />
  );
};

export default FormRichText;
