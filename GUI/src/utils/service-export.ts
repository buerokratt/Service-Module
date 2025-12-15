import { format } from 'date-fns';
import useToastStore from 'store/toasts.store';
import { Service } from 'types';

/**
 * Downloads a single service as a JSON file
 */
export const exportService = async (service: Service, t: (key: string) => string): Promise<void> => {
  try {
    const exportData = {
      serviceId: service.serviceId,
      name: service.name,
      description: service.description,
      slot: service.slot,
      examples: service.examples,
      entities: service.entities,
      state: service.state,
      type: service.type,
      isCommon: service.isCommon,
      structure: service.structure,
      endpoints: service.endpoints,
      exportedAt: new Date().toISOString(),
    };

    const dataString = JSON.stringify(exportData, null, 2);
    const fileName = `${service.name.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;

    if ('showSaveFilePicker' in window) {
      try {
        const blob = new Blob([dataString], { type: 'application/json' });
        const handle = await (window as any).showSaveFilePicker({
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
  } catch (error) {
    useToastStore.getState().error({ title: t('global.notificationError'), message: (error as Error).message });
  }
};

/**
 * Downloads multiple services as a JSON file
 */
export const exportServices = async (
  services: Service[],
  t: (key: string) => string,
  exportAll: boolean = false,
): Promise<void> => {
  if (services.length === 0) {
    return;
  }

  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      services: services.map((service) => ({
        serviceId: service.serviceId,
        name: service.name,
        description: service.description,
        slot: service.slot,
        examples: service.examples,
        entities: service.entities,
        state: service.state,
        type: service.type,
        isCommon: service.isCommon,
        structure: service.structure,
        endpoints: service.endpoints,
      })),
    };

    const dataString = JSON.stringify(exportData, null, 2);
    const fileName = exportAll
      ? `all_services_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`
      : `services_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;

    if ('showSaveFilePicker' in window) {
      try {
        const blob = new Blob([dataString], { type: 'application/json' });
        const handle = await (window as any).showSaveFilePicker({
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
  } catch (error) {
    useToastStore.getState().error({ title: t('global.notificationError'), message: (error as Error).message });
  }
};

