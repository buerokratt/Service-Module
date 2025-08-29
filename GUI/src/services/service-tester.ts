import { testService } from 'resources/api-constants';
import useServiceStore from 'store/new-services.store';
import useTestServiceStore from 'store/test-services.store';
import { removeTrailingUnderscores } from 'utils/string-util';

import { createApiInstance } from './api';
// Types for service test responses
interface ServiceTestErrorResponse {
  dslName: string;
  stepName: string;
  causeCode: string;
  message: string;
}

interface ChatMessage {
  chatId: string;
  content: string;
  buttons: string;
  authorTimestamp: string;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  created: string;
}

interface ServiceTestSuccessResponse {
  response: ChatMessage[];
}

type ServiceTestResponse = ServiceTestErrorResponse | ServiceTestSuccessResponse;

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

  try {
    const testApi = createApiInstance({
      // todo remove hardcoded header value
      // todo add to env and docker compose - test
      // todo readme
      'x-ruuter-testing': 'voorshpellhappilo',
    });
    const response = await testApi.post<ServiceTestResponse>(testService(state, name), { input });

    store.addSuccess('chat.end-of-chat' + '\n\n\n tests');
  } catch (error) {
    if (hasResponseData(error)) {
      const errorData = error.response.data as ServiceTestErrorResponse;
      if (isErrorResponse(errorData)) {
        console.error('runServiceTest: Service test error:', errorData.message);
        store.addError('chat.no-start-node');
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

function isErrorResponse(response: ServiceTestResponse): response is ServiceTestErrorResponse {
  return 'causeCode' in response && 'message' in response;
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
