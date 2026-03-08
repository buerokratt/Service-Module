import * as RadixDialog from '@radix-ui/react-dialog';
import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { Track } from '..';
import './Modal.scss';

type ModalProps = {
  title: string | null;
  titleView?: ReactNode;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
};

const Modal: FC<PropsWithChildren<ModalProps>> = ({ title, titleView, footer, onClose, children, description }) => {
  return (
    <RadixDialog.Root defaultOpen={true} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="modal__overlay" />
        <RadixDialog.Content
          onClick={(e) => e.stopPropagation()}
          className="modal"
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {title && (
            <div className="modal__header">
              <RadixDialog.Title className="h3 modal__title">{title}</RadixDialog.Title>
              {titleView}
            </div>
          )}
          <div className="modal__body">{children}</div>
          {footer && (
            <Track className="modal__footer" gap={16} justify="end">
              {footer}
            </Track>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Modal;
