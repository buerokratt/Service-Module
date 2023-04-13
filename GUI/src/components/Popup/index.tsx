import React, { FC, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { MdOutlineClose } from 'react-icons/md';

import { Icon, Track } from '..';
import './Popup.scss';

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  footer?: ReactNode;
  hasDefaultBody?: boolean;
  onClose: () => void;
}

const Popup: FC<PropsWithChildren<DialogProps>> = ({ title, footer, onClose, hasDefaultBody = true, children, ...rest }) => {
  return (
    <RadixDialog.Root defaultOpen={true} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className='popup__overlay' />
        <RadixDialog.Content className='popup' {...rest}>
          <div className='popup__header'>
            <RadixDialog.Title className='h3 popup__title'>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button className='popup__close'>
                <Icon icon={<MdOutlineClose />} size='medium' />
              </button>
            </RadixDialog.Close>
          </div>
          <div className={hasDefaultBody ? 'popup__body' : ''}>
            {children}
          </div>
          {footer && (
            <Track className='popup__footer' gap={16} justify="end">{footer}</Track>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Popup;
