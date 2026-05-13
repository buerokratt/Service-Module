/**
 * endpoint.service.ts
 *
 * Single common point for endpoint persistence (create & update).
 * Has NO dependency on any Zustand store — all context is passed explicitly.
 * Both the service-flow (via service-builder.ts) and API Registry store
 * call this service directly.
 */

import { createEndpoint, updateEndpoint } from 'resources/api-constants';
import api from 'services/api-dev';
import { EndpointData } from 'types/endpoint';
import { removeTrailingUnderscores } from 'utils/string-util';

function filterTrailingUnderscores(endpoint: EndpointData): void {
  for (const definition of endpoint.definitions ?? []) {
    for (const section of ['body', 'headers', 'params'] as const) {
      if (definition[section]?.variables) {
        for (const v of definition[section].variables) {
          v.name = removeTrailingUnderscores(v.name);
        }
      }
    }
  }
}

/**
 * Persists one or more endpoints.
 *
 * @param endpoints  Endpoints to save. Mutated in-place (isNew cleared, serviceId set).
 * @param serviceId  The service that owns these endpoints. Pass `''` for global/registry endpoints.
 */
export async function persistEndpoints(endpoints: EndpointData[], serviceId: string): Promise<void> {
  const tasks: Promise<any>[] = [];

  for (const endpoint of endpoints) {
    const hasSelectedDefinition = endpoint.definitions.some((d) => d.isSelected);
    if (!hasSelectedDefinition) continue;

    endpoint.serviceId = serviceId;
    endpoint.isCommon = endpoint.isCommon ?? false;
    filterTrailingUnderscores(endpoint);

    if (endpoint.isNew) {
      tasks.push(
        api
          .post(createEndpoint(), {
            ...endpoint,
            description: endpoint.description ?? '',
            definitions: JSON.stringify(endpoint.definitions),
          })
          .then(() => {
            endpoint.isNew = false;
          }),
      );
    } else {
      tasks.push(
        api.post(updateEndpoint(endpoint.endpointId), {
          ...endpoint,
          description: endpoint.description ?? '',
          definitions: JSON.stringify(endpoint.definitions),
        }),
      );
    }
  }

  await Promise.all(tasks);
}
