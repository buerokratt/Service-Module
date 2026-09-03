import { Service } from 'types';

const PINNED_SERVICES_STORAGE_KEY = 'pinned-services';

type PinnedServiceSnapshot = Pick<
  Service,
  'serviceId' | 'name' | 'state' | 'isCommon' | 'description' | 'type' | 'slot' | 'examples' | 'entities'
>;

const readPinnedServices = (): PinnedServiceSnapshot[] => {
  try {
    const stored = localStorage.getItem(PINNED_SERVICES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? (parsed as PinnedServiceSnapshot[]) : [];
  } catch {
    return [];
  }
};

export const getPinnedServiceIds = (): string[] => readPinnedServices().map((service) => service.serviceId);

export const getPinnedServiceSnapshots = (): PinnedServiceSnapshot[] => readPinnedServices();

const writePinnedServices = (services: PinnedServiceSnapshot[]): void => {
  localStorage.setItem(PINNED_SERVICES_STORAGE_KEY, JSON.stringify(services));
};

export const pinService = (service: Service): void => {
  const current = readPinnedServices();
  if (current.some((entry) => entry.serviceId === service.serviceId)) return;
  writePinnedServices([
    ...current,
    {
      serviceId: service.serviceId,
      name: service.name,
      state: service.state,
      isCommon: service.isCommon,
      description: service.description,
      type: service.type,
      slot: service.slot,
      examples: service.examples ?? [],
      entities: service.entities ?? [],
    },
  ]);
};

export const unpinService = (serviceId: string): void => {
  writePinnedServices(readPinnedServices().filter((service) => service.serviceId !== serviceId));
};

export const togglePinnedService = (service: Service): string[] => {
  const isPinned = readPinnedServices().some((entry) => entry.serviceId === service.serviceId);
  if (isPinned) {
    unpinService(service.serviceId);
  } else {
    pinService(service);
  }
  return getPinnedServiceIds();
};

export const isServicePinned = (serviceId: string): boolean =>
  readPinnedServices().some((service) => service.serviceId === serviceId);

export const mergePinnedWithPageServices = (pageServices: Service[], pinnedIds: string[]): Service[] => {
  const pinnedSnapshots = readPinnedServices();
  const pageById = new Map(pageServices.map((service) => [service.serviceId, service]));

  const pinnedServices = pinnedIds
    .map((id) => pageById.get(id) ?? pinnedSnapshots.find((service) => service.serviceId === id))
    .filter((service): service is Service => !!service)
    .map((service) => ({
      ...service,
      id: 'id' in service ? service.id : 0,
      totalPages: 'totalPages' in service ? service.totalPages : 1,
      endpoints: 'endpoints' in service ? service.endpoints : [],
    }));

  const regularServices = pageServices.filter((service) => !pinnedIds.includes(service.serviceId));
  return [...pinnedServices, ...regularServices];
};

export const syncPinnedServiceSnapshots = (pageServices: Service[]): void => {
  const pinned = readPinnedServices();
  if (pinned.length === 0) return;

  const pageById = new Map(pageServices.map((service) => [service.serviceId, service]));
  let changed = false;

  const updated = pinned.map((snapshot) => {
    const fresh = pageById.get(snapshot.serviceId);
    if (!fresh) return snapshot;

    changed = true;
    return {
      serviceId: fresh.serviceId,
      name: fresh.name,
      state: fresh.state,
      isCommon: fresh.isCommon,
      description: fresh.description,
      type: fresh.type,
      slot: fresh.slot,
      examples: fresh.examples ?? [],
      entities: fresh.entities ?? [],
    };
  });

  if (changed) {
    writePinnedServices(updated);
  }
};
