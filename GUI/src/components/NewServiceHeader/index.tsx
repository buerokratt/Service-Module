import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { t } from 'i18next';
import React, { FC, useEffect, useState } from 'react';
import { FaGear } from 'react-icons/fa6';
import { TiArrowLeft } from 'react-icons/ti';
import { useNavigate, useParams } from 'react-router-dom';
import '@buerokratt-ria/header/src/Header.scss';
import { deleteService, getNavigableServicesList } from 'resources/api-constants';
import { ROUTES } from 'resources/routes-constants';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { ServiceState } from 'types';
import { navigateToService } from 'utils/service-navigation-utils';
import { removeTrailingUnderscores } from 'utils/string-util';

import { Button, Modal, Track } from '..';
import api from '../../services/api-dev';
import useServiceListStore from '../../store/services.store';
import Dialog from '../Dialog';
import Icon from '../Icon';
import SettingsModal from '../ServiceConfigurationForm';

import './NewServiceHeader.scss';

type ServiceOption = { readonly name: string; readonly serviceId: string };

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

const NewServiceHeader: FC<NewServiceHeaderProps> = ({ backOnClick, continueOnClick, saveOnClick }) => {
  const name = removeTrailingUnderscores(useServiceStore((state) => state.serviceNameDashed()));
  const serviceState = useServiceStore((state) => state.serviceState);
  const selectedService = useServiceListStore((state) => state.selectedService);
  const [showServiceConfig, setShowServiceConfig] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isDeleteServiceModalVisible, setIsDeleteServiceModalVisible] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const { id } = useParams();

  useEffect(() => {
    if (!isServiceDropdownOpen) return;

    api
      .get(getNavigableServicesList())
      .then((res) => {
        const data: { serviceId: string; name: string }[] = Array.isArray(res.data) ? res.data : [];
        setServices(data.map((s) => ({ name: s.name, serviceId: s.serviceId })));
      })
      .catch(console.error);
  }, [isServiceDropdownOpen]);

  const otherServices = services.filter((service) => service.serviceId !== id);

  return (
    <>
      <header className="new-service-header">
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
          <DropdownMenu.Root open={isServiceDropdownOpen} onOpenChange={setIsServiceDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="naming naming--trigger">
                {name || '...'}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="service-switch-dropdown" sideOffset={5} align="center">
                {otherServices.length === 0 ? (
                  <div className="service-switch-dropdown__empty">
                    {t('serviceFlow.element.jumpToService.noActiveServices')}
                  </div>
                ) : (
                  otherServices.map((service) => (
                    <DropdownMenu.Item
                      key={service.serviceId}
                      className="service-switch-dropdown__item"
                      onSelect={() => navigateToService(service.serviceId, navigate)}
                    >
                      {service.name}
                    </DropdownMenu.Item>
                  ))
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
                try {
                  await useServiceStore.getState().onServiceSave(ServiceState.Draft, false);
                  saveOnClick();
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsSaving(false);
                }
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
