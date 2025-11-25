import { t } from 'i18next';
import React, { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '@buerokratt-ria/header/src/Header.scss';
import { deleteService } from 'resources/api-constants';
import { ROUTES } from 'resources/routes-constants';
import useToastStore from 'store/toasts.store';
import { ServiceState } from 'types';
import { removeTrailingUnderscores } from 'utils/string-util';
import { Button, Modal, Track } from '..';

import api from '../../services/api-dev';
import useServiceListStore from '../../store/services.store';
import SettingsModal from '../ServiceConfigurationForm';
import Dialog from '../Dialog';
import Icon from '../Icon';
import { FaGear } from 'react-icons/fa6';
import { TiArrowLeft } from 'react-icons/ti';
import useServiceStore from 'store/new-services.store';
import './NewServiceHeader.scss';

type NewServiceHeaderProps = {
  activeStep: number;
  backOnClick: () => void;
  continueOnClick: () => void;
  saveOnClick: () => void;
};

const showEmptyNameError = () => {
  useToastStore.getState().error({
    title: t('newService.serviceName.title'),
    message: t('newService.serviceName.placeholder'),
  });
};

const NewServiceHeader: FC<NewServiceHeaderProps> = ({ activeStep, backOnClick, continueOnClick, saveOnClick }) => {
  const name = removeTrailingUnderscores(useServiceStore((state) => state.serviceNameDashed()));
  const serviceState = useServiceStore((state) => state.serviceState);
  const selectedService = useServiceListStore((state) => state.selectedService);
  const [showServiceConfig, setShowServiceConfig] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isDeleteServiceModalVisible, setIsDeleteServiceModalVisible] = useState(false);
  const { id } = useParams();

  return (
    <>
      <header className="header">
        {showServiceConfig && (
          <Dialog
            title={t('serviceFlow.serviceConfiguration')}
            onClose={() => setShowServiceConfig(false)}
            size="large"
          >
            <SettingsModal id={id} />
          </Dialog>
        )}
        <Track justify="between" gap={16}>
          <Button appearance="primary" className={'icon_button'} onClick={backOnClick}>
            <Icon icon={<TiArrowLeft size={20} />} />
            {t('menu.backToServiceListing')}
          </Button>
          <Button appearance="primary" className={'icon_button'} onClick={() => setShowServiceConfig(true)}>
            {t('serviceFlow.serviceConfiguration')}
            <Icon icon={<FaGear size={18} />} size="medium" />
          </Button>
          <div className="naming">{name || '...'}</div>
          <Button
            appearance={isDeleting ? 'loading' : 'error'}
            disabled={
              serviceState && id ? serviceState !== ServiceState.Draft && serviceState !== ServiceState.Ready : true
            }
            onClick={() => {
              setIsDeleteServiceModalVisible(true);
            }}
          >
            {t('serviceFlow.apiElements.delete')}
          </Button>
          <Button
            appearance={isSaving ? 'loading' : 'primary'}
            onClick={async () => {
              if (!name) {
                showEmptyNameError();
              } else {
                setIsSaving(true);
                await useServiceStore.getState().onServiceSave(ServiceState.Draft, false);
                setIsSaving(false);
                saveOnClick();
              }
            }}
          >
            {t('global.save')}
          </Button>
          <Button
            appearance={isContinuing ? 'loading' : 'primary'}
            onClick={() => {
              if (isSaving) {
                useToastStore.getState().info({ title: t('overview.service.toast.cannotContinueUntilServiceIsSaved') });
                return;
              }
              setIsContinuing(true);
              useServiceStore
                .getState()
                .onContinueClick()
                .then(() => {
                  setIsContinuing(false);
                  continueOnClick();
                })
                .catch((error) => {
                  setIsContinuing(false);
                  console.error(error);
                });
            }}
            disabled={!name}
          >
            {t('global.confirm')}
          </Button>
        </Track>
      </header>
      {isDeleteServiceModalVisible && (
        <Modal title={t('overview.popup.delete')} onClose={() => setIsDeleteServiceModalVisible(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setIsDeleteServiceModalVisible(false)}>
              {t('overview.cancel')}
            </Button>
            <Button
              appearance="error"
              onClick={() => {
                setIsDeleteServiceModalVisible(false);
                setIsDeleting(true);
                api
                  .post(deleteService(), {
                    id: selectedService?.serviceId,
                    type: selectedService?.type,
                  })
                  .then(() => {
                    navigate(ROUTES.OVERVIEW_ROUTE, { replace: true });
                    useServiceStore.getState().resetState();
                    setIsDeleting(false);
                  })
                  .catch((error) => {
                    setIsDeleting(false);
                    console.error(error);
                  });
              }}
            >
              {t('overview.delete')}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default NewServiceHeader;
