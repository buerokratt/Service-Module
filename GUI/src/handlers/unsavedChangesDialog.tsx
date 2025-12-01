import { Button, Modal, Track } from 'components';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import useServiceStore from 'store/new-services.store';

export default function UnsavedChangesDialog() {
  const nextLocation = useServiceStore((state) => state.nextLocation);
  const proceedNavigation = useServiceStore((state) => state.proceedNavigation);
  const cancelNavigation = useServiceStore((state) => state.cancelNavigation);
  const navigate = useNavigate();

  if (!nextLocation) return null;

  return (
    <Modal title={t('newService.popup.unsavedChanges')} onClose={() => {}}>
      <Track gap={10} align="center" justify="end">
        <Button appearance="error" onClick={cancelNavigation}>
          {t('global.cancel')}
        </Button>
        <Button
          appearance="primary"
          style={{ marginLeft: 10 }}
          onClick={() => {
            const nextLocation = proceedNavigation();
            if (nextLocation) {
              navigate(nextLocation, { replace: true });
              useServiceStore.getState().resetState();
            }
          }}
        >
          {t('global.continue')}
        </Button>
      </Track>
    </Modal>
  );
}
