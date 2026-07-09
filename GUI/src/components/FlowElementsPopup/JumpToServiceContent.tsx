import { Node } from '@xyflow/react';
import { FormSelect } from 'components/FormElements';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNavigableServicesList } from 'resources/api-constants';
import api from 'services/api-dev';
import { Assign } from 'types/assign';
import { JumpToService } from 'types/jump-to-service';
import { NodeDataProps } from 'types/service-flow';

import Track from '../Track';
import JumpToServiceInputBuilder from './JumpToServiceInputBuilder';
import PreviousVariables from './PreviousVariables';

type ServiceOption = { readonly name: string; readonly serviceId: string };

type JumpToServiceContentProps = {
  readonly node: Node<NodeDataProps>;
  readonly jumpToService: JumpToService;
  readonly onChange: (value: JumpToService) => void;
};

const JumpToServiceContent: FC<JumpToServiceContentProps> = ({ node, jumpToService, onChange }) => {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get(getNavigableServicesList())
      .then((res) => {
        const data: { serviceId: string; name: string }[] = Array.isArray(res.data) ? res.data : [];
        setServices(data.map((s) => ({ name: s.name, serviceId: s.serviceId })));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const serviceOptions = services.map((s) => ({ label: s.name, value: { name: s.name, serviceId: s.serviceId } }));

  const defaultServiceValue =
    jumpToService.serviceId || jumpToService.serviceName?.trim()
      ? (services.find(
          (s) =>
            (jumpToService.serviceId && s.serviceId === jumpToService.serviceId) ||
            s.name === jumpToService.serviceName,
        ) ?? null)
      : null;

  const handleServiceChange = (selection: { label: string; value: { name: string; serviceId: string } } | null) => {
    if (!selection) return;
    const service = services.find((s) => s.serviceId === selection.value.serviceId);
    onChange({
      ...jumpToService,
      serviceName: service?.name ?? selection.label,
      serviceId: service?.serviceId,
    });
  };

  const handleInputChange = (input: Assign[]) => {
    onChange({ ...jumpToService, input });
  };

  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <Track direction="vertical" align="stretch" gap={16} style={{ padding: '16px 16px 0' }}>
        {isLoading ? (
          <Track justify="center">
            <div className="loader" />
          </Track>
        ) : (
          <>
            <FormSelect
              label={t('serviceFlow.element.jumpToService.targetService')}
              name="targetService"
              placeholder={t('serviceFlow.element.jumpToService.selectService')}
              options={serviceOptions}
              defaultValue={defaultServiceValue ?? undefined}
              onSelectionChange={handleServiceChange}
            />
            {services.length === 0 && (
              <p style={{ color: '#888', fontSize: '13px' }}>
                {t('serviceFlow.element.jumpToService.noActiveServices')}
              </p>
            )}
          </>
        )}
      </Track>
      <JumpToServiceInputBuilder seedGroup={jumpToService.input} onChange={handleInputChange} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default JumpToServiceContent;
