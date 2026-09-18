import { act, render } from '@testing-library/react';
import { createRef } from 'react';
import ReactQuill from 'react-quill-new';
import { describe, expect, it, vi } from 'vitest';

import FormRichText from './index';

describe('FormRichText', () => {
  it('reports the content as cleared (null) once all text is deleted, regardless of leftover empty markup', () => {
    const onChange = vi.fn();
    const quillRef = createRef<ReactQuill>();
    render(<FormRichText quill={quillRef} defaultValue="<p>Hello</p>" onChange={onChange} />);

    const editor = quillRef.current!.getEditor();

    act(() => {
      editor.formatLine(0, editor.getLength(), 'list', 'bullet', 'user');
      editor.deleteText(0, editor.getLength() - 1, 'user');
    });

    expect(editor.root.innerHTML).not.toBe('<p><br></p>');
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall?.[0]).toBeNull();
  });
});
