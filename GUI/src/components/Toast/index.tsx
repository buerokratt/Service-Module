import React, { FC, useState } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import {
  MdOutlineClose,
  MdOutlineInfo,
  MdCheckCircleOutline,
  MdOutlineWarningAmber,
  MdErrorOutline,
} from 'react-icons/md'
import clsx from 'clsx'
import useToastStore, { ToastTypeWithId } from '../../store/toasts.store'
import { Icon } from '../../components'
import './Toast.scss'

type ToastProps = {
  toast: ToastTypeWithId
}

const toastIcons = {
  info: <MdOutlineInfo />,
  success: <MdCheckCircleOutline />,
  warning: <MdOutlineWarningAmber />,
  error: <MdErrorOutline />,
}

const Toast: FC<ToastProps> = ({ toast }) => {
  const [open, setOpen] = useState(true)

  const toastClasses = clsx('toast', `toast--${toast.type}`)

  const close = () => useToastStore.getState().close(toast.id);

  return (
    <RadixToast.Root
      className={toastClasses}
      onEscapeKeyDown={close}
      open={open}
      onOpenChange={setOpen}
    >
      <RadixToast.Title className="toast__title h5">
        <Icon icon={toastIcons[toast.type]} />
        {toast.title}
      </RadixToast.Title>
      <RadixToast.Description className="toast__content">{toast.message}</RadixToast.Description>
      <RadixToast.Close
        onClick={close}
        className="toast__close"
      >
        <Icon
          icon={<MdOutlineClose />}
          size="medium"
        />
      </RadixToast.Close>
    </RadixToast.Root>
  )
}

export default Toast
