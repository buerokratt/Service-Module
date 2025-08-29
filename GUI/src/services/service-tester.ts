import { testService } from 'resources/api-constants';
import useServiceStore from 'store/new-services.store';
import useTestServiceStore from 'store/test-services.store';
import { ServiceTestError } from 'types/service-test-error';
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

  // todo display proper error message
  // todo failing node highlight
  // todo style and text

  try {
    const testApi = createApiInstance({
      // todo remove hardcoded header value
      // todo add to env and docker compose - test
      // todo readme
      'x-ruuter-testing': 'voorshpellhappilo',
    });
    await testApi.post(testService(state, name), { input });
    store.addSuccess('chat.service-test-success');
  } catch (error) {
    if (hasResponseData(error)) {
      const errorData = error.response.data;
      if (isErrorResponse(errorData)) {
        console.error('runServiceTest: Service test error:', errorData);
        console.log(serviceStore.nodes);
        console.log(fromSnakeCase(errorData.stepName));

        const node = serviceStore.nodes.find((node) => node.data.label === fromSnakeCase(errorData.stepName));
        console.log('node', node);
        store.addError('chat.service-test-error.title', errorData);
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

function isErrorResponse(response: unknown): response is ServiceTestError {
  return typeof response === 'object' && response !== null && 'causeCode' in response && 'message' in response;
}

function hasResponseData(error: unknown): error is { response: { data: unknown } } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response,
  );
}
