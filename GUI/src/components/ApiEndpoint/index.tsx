import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ApiEndpointCard from 'components/ApiEndpointCard';
import Box from 'components/Box';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Modal from 'components/Modal';
import Track from 'components/Track';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDeleteOutline, MdDragIndicator, MdOutlineEdit } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { deleteEndpoint } from 'resources/api-constants';
import { saveEndpoints } from 'services/service-builder';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { Step, StepType } from 'types';
import { EndpointData } from 'types/endpoint';
import { removeTrailingUnderscores } from 'utils/string-util';

import styles from './ApiEndpoint.module.scss';
import api from '../../services/api-dev';

interface RelatedService {
  serviceId: string;
  name: string;
}

interface ApiEndpointProps {
  step: Step;
  onClick: (step: Step) => void;
}

const ApiEndpoint: FC<ApiEndpointProps> = ({ step, onClick }) => {
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [endpointNameExists, setEndpointNameExists] = useState<boolean>(false);
  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const nodes = useServiceStore((state) => state.nodes);
  const [endpointName, setEndpointName] = useState<string>(step.data?.name ?? '');
  const [isCommonEndpoint, setIsCommonEndpoint] = useState<boolean>(step.data?.isCommon ?? false);
  const originalEndpoint = useMemo(() => {
    return step.data ? JSON.parse(JSON.stringify(step.data)) : undefined;
  }, [step.data]);

  const { deleteEndpoint: deleteEndpointFromStore } = useServiceStore();

  const deleteSelectedEndpoint = async (endpoint: EndpointData | undefined) => {
    if (!endpoint) {
      setIsDeleting(false);
      return;
    }

    try {
      const nodeIdsToDelete = nodes
        .filter((node) => node.type === 'custom' && node.data.originalDefinedNodeId === endpoint.endpointId)
        .map((node) => node.id);
      nodeIdsToDelete.forEach((nodeId) => useServiceStore.getState().onDelete(nodeId));

      await api.post(deleteEndpoint(), {
        id: endpoint.endpointId,
        service_name: serviceName,
        endpoint_name: endpoint.name,
      });
      useToastStore.getState().success({ title: t('serviceFlow.apiElements.deleteSuccess') });
      deleteEndpointFromStore(endpoint.endpointId);
    } catch (error) {
      console.error(`Error deleting API endpoint: ${error}`);
      useToastStore.getState().error({ title: t('serviceFlow.apiElements.deleteError') });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {showDeleteModal && (
        <Modal
          title={t('serviceFlow.apiElements.deleteConfirmationMessage')}
          onClose={() => {
            setShowDeleteModal(false);
          }}
        >
          <Track gap={10} align="center" justify="end">
            <Button
              appearance={isDeleting ? 'loading' : 'error'}
              onClick={() => {
                setIsDeleting(true);
                deleteSelectedEndpoint(step.data);
              }}
            >
              {t('serviceFlow.apiElements.delete')}
            </Button>
            <Button
              appearance="primary"
              style={{ marginLeft: 10 }}
              onClick={(e) => {
                setShowDeleteModal(false);
                e.stopPropagation();
              }}
            >
              {t('global.cancel')}
            </Button>
          </Track>
        </Modal>
      )}

      {showEditModal && step?.data && (
        <Modal
          title={t('newService.editEndpoint')}
          onClose={() => {
            useServiceStore.getState().editEndpoint(originalEndpoint);
            setShowEditModal(false);
          }}
        >
          <Track isMultiline gap={16} direction="vertical" align="stretch">
            <ApiEndpointCard
              endpoint={step?.data}
              onNameExists={setEndpointNameExists}
              onNameChange={setEndpointName}
              onCommonChange={setIsCommonEndpoint}
            />
            <Track justify="end" gap={16}>
              <Button
                appearance="secondary"
                onClick={(e) => {
                  useServiceStore.getState().editEndpoint(originalEndpoint);
                  setShowEditModal(false);
                  e.stopPropagation();
                }}
              >
                {t('overview.cancel')}
              </Button>
              <Button
                appearance={isEditing ? 'loading' : 'primary'}
                disabled={endpointName === '' || endpointNameExists}
                onClick={(e) => {
                  const stepData = step.data!;
                  stepData.name = endpointName;
                  stepData.isCommon = isCommonEndpoint;
                  setIsEditing(true);
                  saveEndpoints(
                    [stepData],
                    () => {
                      setShowEditModal(false);
                      e.stopPropagation();
                      useServiceStore.getState().editEndpoint(stepData);
                      setIsEditing(false);
                      useToastStore.getState().success({ title: t('serviceFlow.apiElements.editSuccess') });
                    },
                    (error) => {
                      console.error(`Error Editing API endpoint: ${error}`);
                      useToastStore.getState().error({ title: t('serviceFlow.apiElements.editError') });
                      setIsEditing(false);
                    },
                  );
                }}
              >
                {t('global.edit')}
              </Button>
            </Track>
          </Track>
        </Modal>
      )}

      {relatedServices.length > 0 && (
        <Modal title={t('serviceFlow.apiElements.deletionImpossible')} onClose={() => setRelatedServices([])}>
          <p>{t('serviceFlow.apiElements.deletionImpossibleMessage')}</p>
          <ol className={styles.popupList}>
            {relatedServices.map((service) => (
              <li key={service.serviceId}>
                <Link to={`/edit/${service.serviceId}`}>{service.name}</Link>
              </li>
            ))}
          </ol>
        </Modal>
      )}

      <Box
        ref={setNodeRef}
        style={style}
        className={styles.box}
        key={step.id}
        color={[StepType.FinishingStepEnd, StepType.FinishingStepRedirect].includes(step.type) ? 'red' : 'blue'}
        onClick={() => onClick(step)}
      >
        <Track gap={8} style={{ justifyContent: 'space-between', overflow: 'hidden' }}>
          <Track gap={8} style={{ alignItems: 'center' }}>
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
              <Icon icon={<MdDragIndicator size={16} />} size="small" />
            </div>
            <div className={styles.labelContainer}>
              {step.type === 'user-defined' && <span className={styles.apiBadge}>API</span>}
              {step.data?.isCommon && <span className={styles.publicBadge}>{t('serviceFlow.apiElements.public')}</span>}
              <span className={styles.label}>{step.label}</span>
            </div>
          </Track>
          <Track gap={12}>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            >
              <Icon icon={<MdOutlineEdit size={18} />} size="medium" />
            </button>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <Icon icon={<MdDeleteOutline size={18} />} size="medium" />
            </button>
          </Track>
        </Track>
      </Box>
    </>
  );
};

export default ApiEndpoint;
