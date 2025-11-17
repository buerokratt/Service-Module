import api from '../services/api-dev';
import { servicesRequestsExplain } from '../resources/api-constants';
import { EndpointDefinition } from '../types/endpoint';

export const extractMapValues = (element: any) => {
  if (element?.rawData && element?.rawData?.length > 0) {
    return element.rawData.value;
  }

  let result: any = {};
  if (element?.variables) {
    for (const entry of element.variables) {
      result = { ...result, [entry.name]: entry.value };
    }
  }
  return result;
};

export const generateJsonRequest = async (endpoint: EndpointDefinition) => {
  try {
    const response = await api.post(servicesRequestsExplain(), {
      requests: [
        {
          url: endpoint.url,
          method: endpoint.methodType,
          headers: extractMapValues(endpoint.headers),
          body: extractMapValues(endpoint.body),
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
