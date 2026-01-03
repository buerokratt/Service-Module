import i18n from 'i18n';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import { importMultipleServices } from 'resources/api-constants';
import api from 'services/api';
import { getYamlContent } from 'services/service-builder';
import useServiceListStore from 'store/services.store';
import useToastStore from 'store/toasts.store';
import { FlowData } from 'types/service-flow';

const isValidFlowData = (data: any): data is FlowData =>
  data?.nodes && data?.edges && Array.isArray(data.nodes) && Array.isArray(data.edges);

const handleImportServices = async (
  event: ChangeEvent<HTMLInputElement>,
): Promise<{
  validFiles: Array<{ fileName: string; flowData: string }>;
  corruptedFiles: string[];
}> => {
  const files = event.target.files;
  if (!files) return { validFiles: [], corruptedFiles: [] };

  const validFiles: Array<{ fileName: string; flowData: string; content: any }> = [];
  const corruptedFiles: string[] = [];

  const fileProcessingPromises = Array.from(files).map(async (file) => {
    const name = file.name.replaceAll(/\s+/g, '_').replace(/\.[^/.]+$/, '');
    try {
      const content = await file.text();
      const flowData = JSON.parse(content) as FlowData;

      if (!isValidFlowData(flowData)) {
        throw new Error('Invalid flow data structure');
      }

      validFiles.push({
        fileName: name,
        flowData: JSON.stringify({ nodes: flowData.nodes, edges: flowData.edges }),
        content: getYamlContent(flowData.nodes, flowData.edges, name, '', false),
      });
    } catch (error) {
      corruptedFiles.push(name);
      console.error(`Error processing file ${name}:`, error);
    }
  });

  await Promise.all(fileProcessingPromises);

  return { validFiles, corruptedFiles };
};

export const importServices = async (event: ChangeEvent<HTMLInputElement>) => {
  const { validFiles, corruptedFiles } = await handleImportServices(event);

  if (corruptedFiles.length > 0) {
    useToastStore.getState().error({
      title: t('global.notificationError'),
      message: t('overview.import.importFailure', { files: corruptedFiles.join(', ') }),
    });
  }

  if (validFiles.length > 0) {
    api
      .post(importMultipleServices(), {
        services: validFiles,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .then(async () => {
        const lengthCheck = i18n.language === 'en' ? 's' : 'ed';
        useToastStore.getState().success({
          title: t('newService.toast.success'),
          message: t('overview.import.importSuccess', {
            count: validFiles.length,
            lengthCheck: validFiles.length === 1 ? '' : lengthCheck,
          }),
        });
        const pagination = { pageIndex: 0, pageSize: 10 };
        const sorting = [{ id: 'name', desc: false }];
        await useServiceListStore.getState().loadServicesList(pagination, sorting);
        await useServiceListStore.getState().loadCommonServicesList(pagination, sorting);
      })
      .catch((error) => {
        console.error('Error importing services:', error);
        useToastStore.getState().error({
          title: t('global.notificationError'),
          message: t('overview.import.failedToImport'),
        });
      });
  }

  event.target.value = '';
};
