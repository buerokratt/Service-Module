import { Node } from '@xyflow/react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceListStore from 'store/services.store';
import { Service, ServiceState } from 'types';
import { Assign } from 'types/assign';
import { JumpToService } from 'types/jump-to-service';
import { NodeDataProps } from 'types/service-flow';

import { FormSelect } from 'components/FormElements';
import Track from '../Track';
import AssignBuilder from './AssignBuilder';
import PreviousVariables from './PreviousVariables';

type JumpToServiceContentProps = {
  readonly node: Node<NodeDataProps>;
  readonly jumpToService: JumpToService;
  readonly onChange: (value: JumpToService) => void;
};

const JumpToServiceContent: FC<JumpToServiceContentProps> = ({ node, jumpToService, onChange }) => {
  const { t } = useTranslation();
  const [activeServices, setActiveServices] = useState<Service[]>([]);

  useEffect(() => {
    useServiceListStore
      .getState()
      .loadServicesList({ pageIndex: 0, pageSize: 100 }, [{ id: 'name', desc: false }])
      .then(() => {
        const services = useServiceListStore.getState().notCommonServices;
        setActiveServices(services.filter((s) => s.state === ServiceState.Active));
      });
  }, []);

  const serviceOptions = activeServices.map((s) => ({
    label: s.name,
    value: s.serviceId ?? s.name,
  }));

  const selectedServiceId =
    activeServices.find((s) => s.name === jumpToService.serviceName)?.serviceId ?? jumpToService.serviceId ?? '';

  const handleServiceChange = (selection: { label: string; value: string } | null) => {
    if (!selection) return;
    const service = activeServices.find((s) => s.serviceId === selection.value);
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
        <FormSelect
          label={t('serviceFlow.element.jumpToService.targetService')}
          name="targetService"
          placeholder={t('serviceFlow.element.jumpToService.selectService')}
          options={serviceOptions}
          defaultValue={selectedServiceId}
          onSelectionChange={handleServiceChange}
        />
        {activeServices.length === 0 && (
          <p style={{ color: '#888', fontSize: '13px' }}>
            {t('serviceFlow.element.jumpToService.noActiveServices')}
          </p>
        )}
      </Track>
      <AssignBuilder seedGroup={jumpToService.parameters} onChange={handleParametersChange} />
      <PreviousVariables node={node} />
    </Track>
  );
};

export default JumpToServiceContent;
