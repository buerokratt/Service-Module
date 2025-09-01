import { testService } from 'resources/api-constants';
import useServiceStore from 'store/new-services.store';
import useTestServiceStore from 'store/test-services.store';
import { ServiceTestError } from 'types/service-test-error';
import { translateObjectKeys } from 'utils/i18n-util';
import { fromSnakeCase, removeTrailingUnderscores } from 'utils/string-util';

import { createApiInstance } from './api';

export const runServiceTest = async (input: string) => {
  const store = useTestServiceStore.getState();
  const serviceStore = useServiceStore.getState();
  const state = serviceStore.serviceState;
  const name = removeTrailingUnderscores(serviceStore.serviceNameDashed());

  if (!state) {
    // This should never happen, widget is hidden until state is set
    console.error('runServiceTest: Service state is not set, not testing.');
    return;
  }

  // todo failing node highlight
  // todo style and text
  // todo more tests - for new functionality

  try {
    const testApi = createApiInstance({
      // todo remove hardcoded header value
      'x-ruuter-testing': 'voorshpellhappilo',
    });
    await testApi.post(testService(state, name), { input });
    store.addSuccess('chat.service-test-success');
  } catch (error) {
    if (hasResponseData(error)) {
      const errorData = error.response.data;
      if (isErrorResponse(errorData)) {
        console.error('runServiceTest: Service test error:', errorData);

        const node = serviceStore.nodes.find((node) => node.data.label === fromSnakeCase(errorData.stepName));

        if (!node) {
          console.error('runServiceTest: Node not found:', errorData);
          store.addError('chat.unknown-error');
          return;
        }

        const payload = translateError(errorData, node.data.label as string);

        store.addError('chat.service-test-error.title', payload);
      } else {
        console.error('runServiceTest: Unknown error response format:', errorData);
        store.addError('chat.unknown-error');
      }
    } else {
      console.error('runServiceTest: Network or other error:', error);
      store.addError('chat.unknown-error');
    }
  }
};

export function isErrorResponse(response: unknown): response is ServiceTestError {
  return typeof response === 'object' && response !== null && 'causeCode' in response && 'message' in response;
}

export function hasResponseData(error: unknown): error is { response: { data: unknown } } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response,
  );
}

export function translateError(error: ServiceTestError, nodeLabel: string): Record<string, string> {
  const translatedError: Record<string, string> = { ...error };
  translatedError.stepName = nodeLabel;

  let translatedCauseCode: string;
  switch (translatedError.causeCode) {
    case 'E_unknown':
      translatedCauseCode = 'chat.service-test-error.causeUnknown';
      break;
    case 'E_null':
      translatedCauseCode = 'chat.service-test-error.causeNull';
      break;
    case 'E_script':
      translatedCauseCode = 'chat.service-test-error.causeScript';
      break;
    default:
      translatedCauseCode = translatedError.causeCode;
  }

  translatedError.causeCode = translatedCauseCode;

  return translateObjectKeys(translatedError, 'chat.service-test-error');
}
