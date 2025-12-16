import { format } from 'date-fns';
import JSZip from 'jszip';
import i18n from 'i18n';
import useToastStore from 'store/toasts.store';
import { Service } from 'types';

const sanitizeFileName = (name: string): string => name.replaceAll(/[^a-z0-9]/gi, '_');
const getTimestamp = (): string => format(new Date(), 'yyyy_MM_dd_HH_mm_ss');

const downloadBlob = async (blob: Blob, fileName: string, mimeType: string, fileExtension: string): Promise<void> => {
  if ('showSaveFilePicker' in globalThis) {
    try {
      const handle = await (globalThis as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: `${fileExtension.toUpperCase()} Files`,
            accept: { [mimeType]: [`.${fileExtension}`] },
          },
        ],
      });
      const writableStream = await handle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
    } catch (error: any) {
      console.error(error);
    }
  } else {
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    URL.revokeObjectURL(url);
  }
};

export const exportServices = async (services: Service[]): Promise<void> => {
  if (services.length === 0) return;

  try {
    const timestamp = getTimestamp();

    if (services.length === 1) {
      const service = services[0];
      const dataString = service?.structure?.value ?? '{}';
      const fileName = `${sanitizeFileName(service.name)}_${timestamp}.json`;
      const blob = new Blob([dataString], { type: 'application/json' });
      await downloadBlob(blob, fileName, 'application/json', 'json');
    } else {
      const zip = new JSZip();
      services.forEach((service) => {
        const dataString = service?.structure?.value ?? '{}';
        const fileName = `${sanitizeFileName(service.name)}_${timestamp}.json`;
        zip.file(fileName, dataString);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `services_${timestamp}.zip`;
      await downloadBlob(zipBlob, zipFileName, 'application/zip', 'zip');
    }
  } catch (error) {
    useToastStore.getState().error({ title: i18n.t('global.notificationError'), message: (error as Error).message });
  }
};
