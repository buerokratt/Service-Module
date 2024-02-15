import React, { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import * as RadixToast from '@radix-ui/react-toast'

import Toast from './index'
import useToastStore from 'store/toasts.store'

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const toasts = useToastStore(state => state.toasts);
  
  return (
    <RadixToast.Provider
      swipeDirection="right"
      label={t('global.notification') || 'Notification'}
    >
      {children}
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
      <RadixToast.Viewport className="toast__list" />
    </RadixToast.Provider>
  )
}
