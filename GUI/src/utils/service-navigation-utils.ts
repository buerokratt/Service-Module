import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from 'resources/routes-constants';
import useServiceStore from 'store/new-services.store';

export const navigateToService = (serviceId: string, navigate: NavigateFunction) => {
  const target = ROUTES.replaceWithId(ROUTES.EDITSERVICE_ROUTE, serviceId);

  if (useServiceStore.getState().hasUnsavedChanges) {
    useServiceStore.getState().handleProgrammaticNavigation(target);
  } else {
    useServiceStore.getState().resetState();
    navigate(target);
  }
};
