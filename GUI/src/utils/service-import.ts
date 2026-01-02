import i18n from 'i18n';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import { importMultipleServices } from 'resources/api-constants';
import api from 'services/api';
import { getYamlContent } from 'services/service-builder';
import useToastStore from 'store/toasts.store';
import { FlowData } from 'types/service-flow';

const isValidFlowData = (data: any): data is FlowData =>
  data?.nodes && data?.edges && Array.isArray(data.nodes) && Array.isArray(data.edges);

const handleImportServices = async (
  event: ChangeEvent<HTMLInputElement>,
): Promise<{
  validFiles: Array<{ fileName: string; flowData: FlowData }>;
  corruptedFiles: string[];
}> => {
  const files = event.target.files;
  if (!files) return { validFiles: [], corruptedFiles: [] };

  const validFiles: Array<{ fileName: string; flowData: FlowData; content: any }> = [];
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
        flowData,
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
      .then(() => {
        const lengthCheck = i18n.language === 'en' ? 's' : 'ed';
        useToastStore.getState().success({
          title: t('newService.toast.success'),
          message: t('overview.import.importSuccess', {
            count: validFiles.length,
            lengthCheck: validFiles.length === 1 ? '' : lengthCheck,
          }),
        });
      });
  }

  event.target.value = '';
};
