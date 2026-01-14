import * as RadixDialog from '@radix-ui/react-dialog';
import React, { FC, HTMLAttributes, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { MdCheck, MdClose, MdOutlineClose, MdOutlineEdit } from 'react-icons/md';

import { Button, FormInput, Icon, Track } from '..';
import './Popup.scss';

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  footer?: ReactNode;
  hasDefaultBody?: boolean;
  onClose: () => void;
  onTitleChange?: (newTitle: string) => void;
  onTitleSave?: (newTitle: string) => void;
  onTitleEditCancel?: () => void;
  titleEditable?: boolean;
  titleError?: string;
};

const Popup: FC<PropsWithChildren<DialogProps>> = ({
  title: initialTitle,
  description,
  footer,
  onClose,
  hasDefaultBody = true,
  titleEditable = false,
  onTitleChange,
  onTitleSave,
  onTitleEditCancel,
  titleError,
  children,
  ...rest
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
    setTempTitle(initialTitle);
  }, [initialTitle]);

  const handleTitleEditStart = () => {
    setTempTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
    setTempTitle(sanitizedValue);
    onTitleChange?.(sanitizedValue);
  };

  const handleTitleSave = () => {
    if (!titleError && tempTitle.trim() !== '') {
      setIsEditingTitle(false);
      setTitle(tempTitle.trim());
      if (onTitleSave && tempTitle !== title) {
        onTitleSave?.(tempTitle.trim());
      }
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setTempTitle(title);
    onTitleEditCancel?.();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };

  const titleRef = useRef<HTMLInputElement>(null);

  // Workaround for a bug that prevents @radix-ui/react-dialog and jsoneditor working together
  // https://github.com/radix-ui/primitives/issues/2122
  // Second part of the fix is in Flow/NodeTypes/CustomNode.tsx
  // Prevent closing the dialog when clicking on JSONEditor modals
  // JSONEditor modals are rendered outside the Radix Dialog portal,
  // so clicks on them are treated as "outside" clicks
  const handleOutsideInteraction = (event: Event) => {
    const target = event.target as HTMLElement;
    // Check if the interaction is on a JSONEditor modal or its children
    if (target.closest('.jsoneditor-modal')) {
      event.preventDefault();
    }
  };

  return (
    <RadixDialog.Root defaultOpen={true} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="popup__overlay" />
        <RadixDialog.Content
          className="popup"
          aria-describedby={description ? 'dialog-description' : undefined}
          onPointerDownOutside={handleOutsideInteraction}
          onInteractOutside={handleOutsideInteraction}
          {...rest}
        >
          <div className="popup__header">
            <Track style={{ width: '100%' }} justify="between" align="center">
              <Track gap={8} style={{ alignItems: 'center' }}>
                {isEditingTitle ? (
                  <Track style={{ alignItems: 'center', gap: 8, width: '100%' }}>
                    <div>
                      <FormInput
                        className="h3 popup__title"
                        ref={titleRef}
                        name={''}
                        placeholder={''}
                        value={tempTitle}
                        onKeyDown={handleTitleKeyDown}
                        onChange={handleTitleChange}
                        maxLength={30}
                        style={{
                          minWidth: '200px',
                          maxWidth: '200px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textOverflow: 'ellipsis',
                        }}
                      />
                    </div>
                    <Button appearance="text" onClick={handleTitleSave} style={{ boxShadow: 'none' }}>
                      <Icon icon={<MdCheck size={20} color="#308653" />} size="medium" />
                    </Button>
                    <Button appearance="text" onClick={handleTitleCancel} style={{ boxShadow: 'none' }}>
                      <Icon icon={<MdClose size={20} color="#D73E3E" />} size="medium" />
                    </Button>
                    {titleEditable && !isEditingTitle && (
                      <Button
                        appearance="text"
                        onClick={() => {
                          titleRef?.current?.focus();
                        }}
                        style={{ boxShadow: 'none' }}
                      >
                        <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
                      </Button>
                    )}
                    {titleError && <label style={{ color: '#D73E3E' }}>{titleError}</label>}
                  </Track>
                ) : (
                  <RadixDialog.Title className="h3 popup__title">{title}</RadixDialog.Title>
                )}
                {titleEditable && !isEditingTitle && (
                  <Button
                    className="popup__edit-title"
                    appearance="text"
                    onClick={handleTitleEditStart}
                    style={{ boxShadow: 'none' }}
                    aria-label="Edit title"
                  >
                    <Icon icon={<MdOutlineEdit color="#686868" />} size="medium" />
                  </Button>
                )}
              </Track>
              <RadixDialog.Close asChild>
                <button className="popup__close">
                  <Icon icon={<MdOutlineClose size={23} />} size="medium" />
                </button>
              </RadixDialog.Close>
            </Track>
          </div>
          <div className={hasDefaultBody ? 'popup__body' : ''}>{children}</div>
          {footer && (
            <Track className="popup__footer" gap={16} justify="end">
              {footer}
            </Track>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Popup;
