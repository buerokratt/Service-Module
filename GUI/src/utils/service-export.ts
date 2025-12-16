import { format } from 'date-fns';
import i18n from 'i18n';
import useToastStore from 'store/toasts.store';
import { Service } from 'types';

export const exportServices = async (services: Service[]): Promise<void> => {
  if (services.length === 0) {
    return;
  }
  try {
    if (services.length === 1) {
      const service = services[0];
      const dataString = service?.structure?.value ?? '{}';
      const fileName = `${service.name.replaceAll(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;

      if ('showSaveFilePicker' in globalThis) {
        try {
          const blob = new Blob([dataString], { type: 'application/json' });
          const handle = await (globalThis as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
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
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataString);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
      }
    } else {
      for (const service of services) {
        const dataString = service?.structure?.value ?? '{}';
        const fileName = `${service.name.replaceAll(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataString);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    useToastStore.getState().error({ title: i18n.t('global.notificationError'), message: (error as Error).message });
  }
};
