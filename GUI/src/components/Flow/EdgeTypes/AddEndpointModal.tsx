import { ApiEndpointCard, Button, Modal, Track } from 'components';
import JsonRequestContent from 'components/FlowElementsPopup/JsonRequestContent';
import { InfoTooltip } from 'components/InfoTooltip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { saveEndpoints } from '../../../services/service-builder';
import { EndpointData } from '../../../types/endpoint/endpoint-data';

interface AddEndpointModalProps {
  onClose: () => void;
  onUpdatePreferences?: (endpointIds: string[]) => void;
  currentEndpointIds?: string[];
  /** When provided, used for API Registry: on save success call this and do not add to service store or preferences. */
  onCreated?: (endpoint: EndpointData) => void;
  /** When true, Save is disabled until the user has run Test at least once. */
  requireTestBeforeSave?: boolean;
}

const AddEndpointModal: React.FC<AddEndpointModalProps> = ({
  onClose,
  onUpdatePreferences,
  currentEndpointIds = [],
  onCreated,
  requireTestBeforeSave = false,
}) => {
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
  const [hasTested, setHasTested] = useState(false);
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const {
    isJsonRequestVisible,
    jsonRequestContent,
    setJsonRequestVisible,
    setJsonRequestContent,
    triggerJsonRequest,
    testUrl,
  } = useServiceStore();

  const handleClose = () => {
    setEndpoint({ endpointId: uuid(), name: '', definitions: [], isNew: true });
    setEndpointName('');
    setIsCommonEndpoint(false);
    setHasTested(false);
    setIsCreatingEndpoint(false);
    setJsonRequestVisible(false);
    setJsonRequestContent(null);
    onClose();
  };

  const handleTestClick = () => {
    if (requireTestBeforeSave) {
      const ep = { ...endpoint, name: endpointName || endpoint.name };
      ep.definitions = endpoint.definitions.map((d) => ({ ...d }));
      if (ep.definitions[0]) ep.definitions[0].url = ep.definitions[0].url ?? ep.definitions[0].path ?? '';
      setIsTesting(true);
      void testUrl(
        ep,
        () => {
          setIsTesting(false);
          useToastStore.getState().error({ title: t('newService.endpoint.error') });
        },
        () => {
          setHasTested(true);
          setIsTesting(false);
          useToastStore.getState().success({ title: t('newService.endpoint.success') });
        },
      );
    } else {
      if (endpoint) {
        const endpointData = {
          ...endpoint,
          definitions: endpoint.definitions.map((def) => ({ ...def })),
        };
        triggerJsonRequest(endpointData);
      }
    }
  };

  const handleCreate = () => {
    const passedEndpoint = endpoint;
    passedEndpoint.name = endpointName;
    passedEndpoint.isCommon = isCommonEndpoint;
    setIsCreatingEndpoint(true);

    void saveEndpoints(
      [passedEndpoint],
      () => {
        if (onCreated) {
          passedEndpoint.isNew = false;
          onCreated(passedEndpoint);
        } else {
          useServiceStore.getState().addEndpoint(passedEndpoint);
          const newEndpointIds = [...currentEndpointIds, passedEndpoint.endpointId];
          onUpdatePreferences?.(newEndpointIds);
        }
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

  const canSave = endpointName !== '' && !endpointNameExists && (!requireTestBeforeSave || hasTested);

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
          <Button
            onClick={handleTestClick}
            appearance={isTesting ? 'loading' : 'secondary'}
            disabled={requireTestBeforeSave && !endpoint.definitions?.[0]?.url && !endpoint.definitions?.[0]?.path}
          >
            {t('newService.test')}
          </Button>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={handleClose}>
              {t('overview.cancel')}
            </Button>
            <Button appearance={isCreatingEndpoint ? 'loading' : 'primary'} disabled={!canSave} onClick={handleCreate}>
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
