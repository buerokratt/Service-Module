import * as RadixToast from '@radix-ui/react-toast';
import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { MdCheck, MdFlag, MdInfo, MdOutlineClose, MdWarning } from 'react-icons/md';

import { Icon } from '../../components';
import useToastStore, { ToastTypeWithId } from '../../store/toasts.store';
import './Toast.scss';

type ToastProps = {
  toast: ToastTypeWithId;
};

const toastIcons = {
  info: <MdInfo />,
  success: <MdCheck />,
  warning: <MdFlag />,
  error: <MdWarning />,
};

const Toast: FC<ToastProps> = ({ toast }) => {
  const [open, setOpen] = useState(true);

  const toastClasses = clsx('service-toast', `service-toast--${toast.type}`);

  const close = () => useToastStore.getState().close(toast.id);

  return (
    <RadixToast.Root className={toastClasses} onEscapeKeyDown={close} open={open} onOpenChange={setOpen}>
      <Icon icon={toastIcons[toast.type]} />
      <div className="service-toast__body">
        <RadixToast.Title className="service-toast__title h6">
          {toast.title}
          {toast.message ? ':' : ''}
        </RadixToast.Title>
        {toast.message && (
          <RadixToast.Description className="service-toast__content">{toast.message}</RadixToast.Description>
        )}
      </div>
      <RadixToast.Close onClick={close} className="service-toast__close">
        <Icon icon={<MdOutlineClose />} size="small" />
      </RadixToast.Close>
    </RadixToast.Root>
  );
};

export default Toast;
