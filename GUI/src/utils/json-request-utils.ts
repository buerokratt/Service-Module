import { servicesRequestsExplain } from '../resources/api-constants';
import api from '../services/api-dev';
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
    console.log('Generating JSON request for endpoint: ', endpoint);
    const isRawBodySelected = endpoint?.body?.isRawSelected ?? false;
    const rawBody = endpoint?.body?.rawData ?? {};
    let body: any = extractMapValues(endpoint.body);

    if (isRawBodySelected) {
      try {
        const rawJson = JSON.parse(rawBody?.value ?? '');
        body = rawJson;
      } catch (e: any) {
        body = extractMapValues(endpoint.body);
        console.log(`Unable to save JSON to Yaml. ${e.message}`);
      }
    }

    const response = await api.post(servicesRequestsExplain(), {
      requests: [
        {
          url: endpoint.url,
          method: endpoint.methodType,
          headers: extractMapValues(endpoint.headers),
          body: body,
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
