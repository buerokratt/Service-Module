import { Node } from '@xyflow/react';
import { FormSelect } from 'components/FormElements';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getActiveServicesList } from 'resources/api-constants';
import api from 'services/api-dev';
import { Assign } from 'types/assign';
import { JumpToService } from 'types/jump-to-service';
import { NodeDataProps } from 'types/service-flow';

import Track from '../Track';
import AssignBuilder from './AssignBuilder';
import PreviousVariables from './PreviousVariables';

type ServiceOption = { name: string; serviceId: string };

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
      .get(getActiveServicesList())
      .then((res) => {
        const data: { service_id: string; name: string }[] = Array.isArray(res.data) ? res.data : [];
        setServices(data.map((s) => ({ serviceId: s.service_id, name: s.name })));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const serviceOptions = services.map((s) => ({ label: s.name, value: s.serviceId }));

  const selectedServiceId =
    services.find((s) => s.name === jumpToService.serviceName)?.serviceId ?? jumpToService.serviceId ?? '';

  const handleServiceChange = (selection: { label: string; value: string } | null) => {
    if (!selection) return;
    const service = services.find((s) => s.serviceId === selection.value);
    onChange({
      ...jumpToService,
      serviceName: service?.name ?? selection.label,
      serviceId: service?.serviceId,
    });
  };

  const handleParametersChange = (parameters: Assign[]) => {
    onChange({ ...jumpToService, parameters });
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
              defaultValue={selectedServiceId}
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
      <AssignBuilder seedGroup={jumpToService.parameters} onChange={handleParametersChange} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default JumpToServiceContent;
