import { ApiEndpointCard, Button, Modal, Track } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { saveEndpoints } from '../../../services/service-builder';
import { EndpointData } from '../../../types/endpoint/endpoint-data';
import { InfoTooltip } from 'components/InfoTooltip';
import JsonRequestContent from 'components/FlowElementsPopup/JsonRequestContent';

interface AddEndpointModalProps {
  onClose: () => void;
  onUpdatePreferences: (endpointIds: string[]) => void;
  currentEndpointIds: string[];
}

const AddEndpointModal: React.FC<AddEndpointModalProps> = ({ onClose, onUpdatePreferences, currentEndpointIds }) => {
  const { t } = useTranslation();
  const [endpoint, setEndpoint] = useState<EndpointData>({
    endpointId: uuid(),
    name: '',
    definitions: [],
    isNew: true,
  });
  const [endpointName, setEndpointName] = useState('');
  const [endpointNameExists, setEndpointNameExists] = useState(false);
  const [isCommonEndpoint, setIsCommonEndpoint] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const { isJsonRequestVisible, jsonRequestContent, setJsonRequestVisible, setJsonRequestContent, triggerJsonRequest } = useServiceStore();

  const handleClose = () => {
    setEndpoint({ endpointId: uuid(), name: '', definitions: [], isNew: true });
    setEndpointName('');
    setIsCommonEndpoint(false);
    setIsCreatingEndpoint(false);
    setJsonRequestVisible(false);
    setJsonRequestContent(null);
    onClose();
  };

  const handleCreate = () => {
    const passedEndpoint = endpoint;
    passedEndpoint.name = endpointName;
    passedEndpoint.isCommon = isCommonEndpoint;
    setIsCreatingEndpoint(true);

    void saveEndpoints(
      [passedEndpoint],
      () => {
        useServiceStore.getState().addEndpoint(passedEndpoint);
        // Add the new endpoint to user preferences
        const newEndpointIds = [...currentEndpointIds, passedEndpoint.endpointId];
        onUpdatePreferences(newEndpointIds);

        handleClose();
        useToastStore.getState().success({ title: t('serviceFlow.apiElements.createSuccess') });
        setIsCreatingEndpoint(false);
      },
      (error) => {
        console.error(`Error creating API endpoint: ${error}`);
        useToastStore.getState().error({ title: t('serviceFlow.apiElements.createError') });
        setIsCreatingEndpoint(false);
      },
    );
  };

   const handleJsonRequestClick = () => {
     if (endpoint) {
       const endpointData = {
         ...endpoint,
         definitions: endpoint.definitions.map((def) => ({ ...def })),
       };
       triggerJsonRequest(endpointData);
     }
   };


  return (
    <Modal
      title={t('newService.createNewEndpoint')}
      onClose={handleClose}
      titleView={
        <Track gap={5} align="center">
          <label style={{ fontStyle: 'italic' }}>{t('newService.endpoint.global')}</label>
          <InfoTooltip name={t('newService.endpoint.tooltip.global')} />
        </Track>
      }
    >
      <Track isMultiline gap={16} direction="vertical" align="stretch">
        <ApiEndpointCard
          endpoint={endpoint}
          onNameExists={setEndpointNameExists}
          onNameChange={setEndpointName}
          onCommonChange={setIsCommonEndpoint}
        />
        <Track justify="between" gap={16}>
          <Button onClick={handleJsonRequestClick}>{t('newService.test')}</Button>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={handleClose}>
              {t('overview.cancel')}
            </Button>
            <Button
              appearance={isCreatingEndpoint ? 'loading' : 'primary'}
              disabled={endpointName === '' || endpointNameExists}
              onClick={handleCreate}
            >
              {t('global.create')}
            </Button>
          </Track>
        </Track>
        <JsonRequestContent padding={10} isVisible={isJsonRequestVisible} jsonContent={jsonRequestContent} />
      </Track>
    </Modal>
  );
};

export default AddEndpointModal;
