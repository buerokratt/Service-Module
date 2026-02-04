import { extractMapValues, getEndpointBody } from 'store/new-services.store';

import { servicesRequestsExplain } from '../resources/api-constants';
import api from '../services/api-dev';
import { EndpointDefinition } from '../types/endpoint';

export const generateJsonRequest = async (endpoint: EndpointDefinition) => {
  try {
    const response = await api.post(servicesRequestsExplain(), {
      requests: [
        {
          url: endpoint.url,
          method: endpoint.methodType,
          headers: extractMapValues(endpoint.headers),
          body: getEndpointBody(endpoint),
          params: extractMapValues(endpoint.params),
        },
      ],
    });
    return response.data.response;
  } catch (error) {
    console.error('Error generating JSON request: ', error);
    throw error;
  }
};
