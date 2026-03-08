import { ApiEndpointCard, Button, Modal, Track } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { saveEndpoints } from '../../../services/service-builder';
import { EndpointData } from '../../../types/endpoint/endpoint-data';
import { InfoTooltip } from 'components/InfoTooltip';
import JsonRequestContent from 'components/FlowElementsPopup/JsonRequestContent';

interface EditEndpointModalProps {
  endpoint: EndpointData;
  onClose: () => void;
  onSaved: (updatedEndpoint: EndpointData) => void;
}

const EditEndpointModal: React.FC<EditEndpointModalProps> = ({ endpoint, onClose, onSaved }) => {
  const { t } = useTranslation();
  const [endpointName, setEndpointName] = useState(endpoint.name ?? '');
  const [endpointNameExists, setEndpointNameExists] = useState(false);
  const [isCommonEndpoint, setIsCommonEndpoint] = useState(endpoint.isCommon ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const { isJsonRequestVisible, jsonRequestContent, setJsonRequestVisible, setJsonRequestContent, triggerJsonRequest } =
    useServiceStore();

  const handleClose = () => {
    setJsonRequestVisible(false);
    setJsonRequestContent(null);
    onClose();
  };

  const handleTestClick = () => {
    const endpointData = { ...endpoint, definitions: endpoint.definitions.map((def) => ({ ...def })) };
    triggerJsonRequest(endpointData);
  };

  const handleSave = () => {
    const updated = { ...endpoint };
    updated.name = endpointName;
    updated.isCommon = isCommonEndpoint;
    setIsSaving(true);
    void saveEndpoints(
      [updated],
      () => {
        onSaved(updated);
        handleClose();
        useToastStore.getState().success({ title: t('serviceFlow.apiElements.editSuccess') });
        setIsSaving(false);
      },
      (error) => {
        console.error(`Error editing API endpoint: ${error}`);
        useToastStore.getState().error({ title: t('serviceFlow.apiElements.editError') });
        setIsSaving(false);
      },
    );
  };

  return (
    <Modal
      title={t('newService.editEndpoint')}
      titleView={
        <Track gap={5} align="center">
          <label style={{ fontStyle: 'italic' }}>{t('newService.endpoint.global')}</label>
          <InfoTooltip name={t('newService.endpoint.tooltip.global')} />
        </Track>
      }
      onClose={handleClose}
    >
      <Track isMultiline gap={16} direction="vertical" align="stretch">
        <ApiEndpointCard
          endpoint={endpoint}
          onNameExists={setEndpointNameExists}
          onNameChange={setEndpointName}
          onCommonChange={setIsCommonEndpoint}
        />
        <Track justify="between" gap={16}>
          <Button onClick={handleTestClick}>{t('newService.test')}</Button>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={handleClose}>
              {t('overview.cancel')}
            </Button>
            <Button
              appearance={isSaving ? 'loading' : 'primary'}
              disabled={endpointName === '' || endpointNameExists}
              onClick={handleSave}
            >
              {t('global.edit')}
            </Button>
          </Track>
        </Track>
        <JsonRequestContent padding={10} isVisible={isJsonRequestVisible} jsonContent={jsonRequestContent} />
      </Track>
    </Modal>
  );
};

export default EditEndpointModal;
