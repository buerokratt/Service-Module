import * as RadixToast from '@radix-ui/react-toast';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import useToastStore from 'store/toasts.store';

import { POPUP_DURATION } from '../../constants/consts';

import Toast from './index';

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const toasts = useToastStore((state) => state.toasts);

  return (
    <RadixToast.Provider
      swipeDirection="right"
      label={t('global.notification') ?? 'Notification'}
      duration={POPUP_DURATION * 1000}
    >
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
      <RadixToast.Viewport className="toast__list" />
    </RadixToast.Provider>
  );
};
