import { ApiEndpointCard, Button, Modal, Track } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { saveEndpoints } from '../../../services/service-builder';
import { EndpointData } from '../../../types/endpoint/endpoint-data';



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

  const handleClose = () => {
    setEndpoint({ endpointId: uuid(), name: '', definitions: [], isNew: true });
    setEndpointName('');
    setIsCommonEndpoint(false);
    setIsCreatingEndpoint(false);
    onClose();
  };

  const handleCreate = () => {
    const passedEndpoint = endpoint;
    passedEndpoint.name = endpointName;
    passedEndpoint.isCommon = isCommonEndpoint;
    setIsCreatingEndpoint(true);

    saveEndpoints(
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

  return (
    <Modal title={t('newService.createNewEndpoint')} onClose={handleClose}>
      <Track isMultiline gap={16} direction="vertical" align="stretch">
        <ApiEndpointCard
          endpoint={endpoint}
          isDeletable={false}
          onNameExists={setEndpointNameExists}
          onNameChange={setEndpointName}
          onCommonChange={setIsCommonEndpoint}
        />
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
    </Modal>
  );
};

export default AddEndpointModal;
