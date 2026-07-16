import { t } from 'i18next';
import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from 'resources/routes-constants';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';

export const navigateToService = (serviceId: string, navigate: NavigateFunction) => {
  if (serviceId === useServiceStore.getState().serviceId) {
    useToastStore.getState().info({ title: t('serviceFlow.element.jumpToService.alreadyOnService') });
    return;
  }

  const target = ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, serviceId);

  if (useServiceStore.getState().hasUnsavedChanges) {
    useServiceStore.getState().handleProgrammaticNavigation(target);
  } else {
    useServiceStore.getState().resetState();
    navigate(target);
  }
};
