import { ApiEndpointCard, Button, Modal, Track } from 'components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCommonEndpoints } from 'resources/api-constants';
import api from 'services/api-dev';
import { persistEndpoints } from 'services/endpoint.service';
import useApiRegistryStore from 'store/api-registry.store';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { v4 as uuid } from 'uuid';

import { EndpointData } from '../../../types/endpoint/endpoint-data';

interface AddEndpointModalProps {
  onClose: () => void;
  /** Service-flow create: update the edge's endpoint preference list */
  onUpdatePreferences?: (endpointIds: string[]) => void;
  /** Service-flow create: current endpoint ids on this edge */
  currentEndpointIds?: string[];
  /** 'create' (default) or 'edit' */
  mode?: 'create' | 'edit';
  /** 'service' (default) or 'registry' */
  context?: 'service' | 'registry';
  /** Edit mode: the endpoint to pre-fill (will be deep-cloned internally) */
  initialEndpoint?: EndpointData;
}

const AddEndpointModal: React.FC<AddEndpointModalProps> = ({
  onClose,
  onUpdatePreferences,
  currentEndpointIds,
  mode = 'create',
  context = 'service',
  initialEndpoint,
}) => {
  const { t } = useTranslation();

  const [endpoint] = useState<EndpointData>(() => {
    if (mode === 'edit' && initialEndpoint) {
      return JSON.parse(JSON.stringify(initialEndpoint)) as EndpointData;
    }
    return { endpointId: uuid(), name: '', definitions: [], isNew: true };
  });

  const [endpointName, setEndpointName] = useState(
    mode === 'edit' && initialEndpoint ? initialEndpoint.name : '',
  );
  const [endpointNameExists, setEndpointNameExists] = useState(false);
  const [isCommonEndpoint, setIsCommonEndpoint] = useState(
    mode === 'edit' && initialEndpoint ? (initialEndpoint.isCommon ?? false) : false,
  );
  const [isSaving, setIsSaving] = useState(false);

  // Registry-specific: async debounced name check (paginated store can't do this synchronously)
  const [registryNameExists, setRegistryNameExists] = useState(false);
  const [registryNameChecking, setRegistryNameChecking] = useState(false);

  const { setJsonRequestVisible, setJsonRequestContent } = useServiceStore();

  useEffect(() => {
    if (context !== 'registry' || !endpointName) {
      setRegistryNameExists(false);
      setRegistryNameChecking(false); // reset if name was cleared mid-check
      return;
    }
    setRegistryNameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const result = await api.post(getCommonEndpoints(), {
          page: 1,
          page_size: 50,
          sorting: 'name asc',
          search: endpointName,
          pagination: false,
        });
        const rows: any[] = result.data?.response ?? [];
        // Exact-match check; exclude self when editing
        const exists = rows.some(
          (row) => row.name === endpointName && row.endpointId !== endpoint.endpointId,
        );
        setRegistryNameExists(exists);
      } catch {
        setRegistryNameExists(false);
      } finally {
        setRegistryNameChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [endpointName, context, endpoint.endpointId]);

  const effectiveNameExists = context === 'registry' ? registryNameExists : endpointNameExists;

  const handleClose = () => {
    // Service edit: the store was never mutated (we worked on a clone), nothing to revert
    setJsonRequestVisible(false);
    setJsonRequestContent(null);
    onClose();
  };

  const handleSave = () => {
    const passedEndpoint = endpoint;
    passedEndpoint.name = endpointName;
    passedEndpoint.isCommon = isCommonEndpoint;
    setIsSaving(true);

    // Resolve serviceId: service-flow gets it from the store; registry preserves the
    // endpoint's own serviceId (edit) or uses empty string (create).
    const serviceId =
      context === 'service'
        ? useServiceStore.getState().serviceId
        : passedEndpoint.serviceId ?? '';

    persistEndpoints([passedEndpoint], serviceId)
      .then(() => {
        // Update local store state after successful persist
        if (context === 'registry') {
          if (mode === 'create') {
            useApiRegistryStore.getState().addEndpointAfterCreate(passedEndpoint);
          } else {
            useApiRegistryStore.getState().updateEndpointInList(passedEndpoint);
          }
        } else {
          if (mode === 'create') {
            useServiceStore.getState().addEndpoint(passedEndpoint);
            const newEndpointIds = [...(currentEndpointIds ?? []), passedEndpoint.endpointId];
            onUpdatePreferences?.(newEndpointIds);
          } else {
            useServiceStore.getState().editEndpoint(passedEndpoint);
          }
        }
        const successKey = mode === 'create' ? 'serviceFlow.apiElements.createSuccess' : 'serviceFlow.apiElements.editSuccess';
        useToastStore.getState().success({ title: t(successKey) });
        setIsSaving(false);
        setJsonRequestVisible(false);
        setJsonRequestContent(null);
        onClose();
      })
      .catch((error) => {
        console.error(`Error saving API endpoint: ${error}`);
        const errorKey = mode === 'create' ? 'serviceFlow.apiElements.createError' : 'serviceFlow.apiElements.editError';
        useToastStore.getState().error({ title: t(errorKey) });
        setIsSaving(false);
      });
  };

  const modalTitle = mode === 'edit' ? t('newService.editEndpoint') : t('newService.createNewEndpoint');

  return (
    <Modal title={modalTitle} onClose={handleClose}>
      <Track isMultiline gap={16} direction="vertical" align="stretch">
        <ApiEndpointCard
          endpoint={endpoint}
          onNameExists={context === 'registry' ? undefined : setEndpointNameExists}
          onNameChange={setEndpointName}
          onCommonChange={setIsCommonEndpoint}
          overrideNameExists={context === 'registry' ? registryNameExists : undefined}
        />
        <Track justify="end" gap={16}>
          <Button appearance="secondary" onClick={handleClose}>
            {t('overview.cancel')}
          </Button>
          <Button
            appearance={isSaving ? 'loading' : 'primary'}
            disabled={endpointName === '' || effectiveNameExists || registryNameChecking}
            onClick={handleSave}
          >
            {t('global.save')}
          </Button>
        </Track>
      </Track>
    </Modal>
  );
};

export default AddEndpointModal;

