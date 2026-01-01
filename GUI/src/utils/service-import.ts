import i18n from "i18n";
import { t } from "i18next";
import { ChangeEvent } from "react";
import useToastStore from "store/toasts.store";
import { FlowData } from "types/service-flow";

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

  const validFiles: Array<{ fileName: string; flowData: FlowData }> = [];
  const corruptedFiles: string[] = [];

  const fileProcessingPromises = Array.from(files).map(async (file) => {
    const name = file.name.replaceAll(/\s+/g, '_');
    try {
      const content = await file.text();
      const flowData = JSON.parse(content) as FlowData;

      if (!isValidFlowData(flowData)) {
        throw new Error('Invalid flow data structure');
      }

      validFiles.push({
        fileName: name,
        flowData,
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
    validFiles.forEach(({ fileName, flowData }) => {
      console.log(`Successfully imported ${fileName}`, flowData);
      // Add your logic to handle each valid flowData
    });

    if (validFiles.length > 0) {
      const lengthCheck = i18n.language === 'en' ? 's' : 'ed';
      useToastStore.getState().success({
        title: t('newService.toast.success'),
        message: t('overview.import.importSuccess', {
          count: validFiles.length,
          lengthCheck: validFiles.length === 1 ? '' : lengthCheck,
        }),
      });
    }
  }

  event.target.value = '';
};
