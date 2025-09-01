import { t } from 'i18next';
import { ServiceStoreState } from 'store/new-services.store';
import { ServiceState } from 'types';
import { ServiceTestError } from 'types/service-test-error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPreviousTestStates,
  executeServiceTest,
  handleTestError,
  hasResponseData,
  isErrorResponse,
  translateError,
  updateNodeTestState,
  validateTestEnvironment,
} from './service-tester';

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn(),
}));

// Mock dependencies for executeServiceTest
vi.mock('./api', () => ({
  createApiInstance: vi.fn(),
}));

vi.mock('resources/api-constants', () => ({
  testService: vi.fn(),
}));

// Mock dependencies for handleTestError
vi.mock('store/test-services.store', () => ({
  default: {
    getState: vi.fn(() => ({
      addError: vi.fn(),
    })),
  },
}));

vi.mock('utils/string-util', () => ({
  fromSnakeCase: vi.fn((str) => str),
}));

describe('translateErrorPayload', () => {
  const mockErrorTranslation = {
    dslName: 'translated.dslName',
    stepName: 'translated.stepName',
    causeCode: 'translated.causeCode',
    message: 'translated.message',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (t as any).mockReturnValue(mockErrorTranslation);
  });

  it('should translate E_unknown cause code correctly', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_unknown',
      message: 'Unknown error occurred',
    };
    const nodeLabel = 'Test Node';

    const result = translateError(error, nodeLabel);

    expect(t).toHaveBeenCalledWith('chat.service-test-error', { returnObjects: true });
    expect(result).toEqual({
      'translated.dslName': 'test-service',
      'translated.stepName': 'Test Node',
      'translated.causeCode': 'chat.service-test-error.causeUnknown',
      'translated.message': 'Unknown error occurred',
    });
  });

  it('should translate E_null cause code correctly', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_null',
      message: 'Null value error',
    };
    const nodeLabel = 'Null Test Node';

    const result = translateError(error, nodeLabel);

    expect(result).toEqual({
      'translated.dslName': 'test-service',
      'translated.stepName': 'Null Test Node',
      'translated.causeCode': 'chat.service-test-error.causeNull',
      'translated.message': 'Null value error',
    });
  });

  it('should translate E_script cause code correctly', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_script',
      message: 'Script execution error',
    };
    const nodeLabel = 'Script Test Node';

    const result = translateError(error, nodeLabel);

    expect(result).toEqual({
      'translated.dslName': 'test-service',
      'translated.stepName': 'Script Test Node',
      'translated.causeCode': 'chat.service-test-error.causeScript',
      'translated.message': 'Script execution error',
    });
  });

  it('should handle unknown cause codes by using the original value', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_unknown' as any, // Type assertion to test unknown cause code
      message: 'Unknown cause code error',
    };
    const nodeLabel = 'Unknown Cause Node';

    // Temporarily modify the cause code to test unknown case
    const testError = { ...error, causeCode: 'E_custom' as any };

    const result = translateError(testError, nodeLabel);

    expect(result).toEqual({
      'translated.dslName': 'test-service',
      'translated.stepName': 'Unknown Cause Node',
      'translated.causeCode': 'E_custom',
      'translated.message': 'Unknown cause code error',
    });
  });

  it('should replace stepName with nodeLabel', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step-name',
      causeCode: 'E_unknown',
      message: 'Test message',
    };
    const nodeLabel = 'New Node Label';

    const result = translateError(error, nodeLabel);

    expect(result['translated.stepName']).toBe('New Node Label');
    expect(result['translated.stepName']).not.toBe('original-step-name');
  });

  it('should convert all values to strings', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_null',
      message: 'Test message',
    };
    const nodeLabel = 'Test Node';

    const result = translateError(error, nodeLabel);

    // Verify all values are strings
    Object.values(result).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });

  it('should preserve all original error properties', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_script',
      message: 'Test message',
    };
    const nodeLabel = 'Test Node';

    const result = translateError(error, nodeLabel);

    // Check that all original properties are present (with translated keys)
    expect(result).toHaveProperty('translated.dslName');
    expect(result).toHaveProperty('translated.stepName');
    expect(result).toHaveProperty('translated.causeCode');
    expect(result).toHaveProperty('translated.message');
  });

  it('should handle empty strings and special characters', () => {
    const error: ServiceTestError = {
      dslName: '',
      stepName: 'original-step',
      causeCode: 'E_unknown',
      message: 'Special chars: !@#$%^&*()',
    };
    const nodeLabel = '';

    const result = translateError(error, nodeLabel);

    expect(result).toEqual({
      'translated.dslName': '',
      'translated.stepName': '',
      'translated.causeCode': 'chat.service-test-error.causeUnknown',
      'translated.message': 'Special chars: !@#$%^&*()',
    });
  });

  it('should call i18next with correct parameters', () => {
    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_null',
      message: 'Test message',
    };
    const nodeLabel = 'Test Node';

    translateError(error, nodeLabel);

    expect(t).toHaveBeenCalledWith('chat.service-test-error', { returnObjects: true });
    expect(t).toHaveBeenCalledTimes(1);
  });

  it('should handle different translation object structures', () => {
    const customTranslation = {
      dslName: 'custom.dslName',
      stepName: 'custom.stepName',
      causeCode: 'custom.causeCode',
      message: 'custom.message',
    };

    (t as any).mockReturnValue(customTranslation);

    const error: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'original-step',
      causeCode: 'E_unknown',
      message: 'Test message',
    };
    const nodeLabel = 'Test Node';

    const result = translateError(error, nodeLabel);

    expect(result).toEqual({
      'custom.dslName': 'test-service',
      'custom.stepName': 'Test Node',
      'custom.causeCode': 'chat.service-test-error.causeUnknown',
      'custom.message': 'Test message',
    });
  });
});

describe('isErrorResponse', () => {
  it('should return true for valid ServiceTestError objects', () => {
    const validError: ServiceTestError = {
      dslName: 'test-service',
      stepName: 'test-step',
      causeCode: 'E_unknown',
      message: 'Test error message',
    };

    expect(isErrorResponse(validError)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isErrorResponse(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isErrorResponse(undefined)).toBe(false);
  });

  it('should return false for primitive types', () => {
    expect(isErrorResponse('string')).toBe(false);
    expect(isErrorResponse(123)).toBe(false);
    expect(isErrorResponse(true)).toBe(false);
    expect(isErrorResponse(false)).toBe(false);
  });

  it('should return false for objects missing causeCode', () => {
    const invalidError = {
      dslName: 'test-service',
      stepName: 'test-step',
      message: 'Test error message',
    };

    expect(isErrorResponse(invalidError)).toBe(false);
  });

  it('should return false for objects missing message', () => {
    const invalidError = {
      dslName: 'test-service',
      stepName: 'test-step',
      causeCode: 'E_unknown',
    };

    expect(isErrorResponse(invalidError)).toBe(false);
  });

  it('should return false for objects missing both causeCode and message', () => {
    const invalidError = {
      dslName: 'test-service',
      stepName: 'test-step',
    };

    expect(isErrorResponse(invalidError)).toBe(false);
  });

  it('should return true for objects with extra properties', () => {
    const validErrorWithExtra = {
      dslName: 'test-service',
      stepName: 'test-step',
      causeCode: 'E_null',
      message: 'Test error message',
      extraProperty: 'extra value',
    };

    expect(isErrorResponse(validErrorWithExtra)).toBe(true);
  });

  it('should return false for empty objects', () => {
    expect(isErrorResponse({})).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isErrorResponse([])).toBe(false);
    expect(isErrorResponse([1, 2, 3])).toBe(false);
  });
});

describe('hasResponseData', () => {
  it('should return true for objects with valid response.data structure', () => {
    const validError = {
      response: {
        data: { someData: 'value' },
      },
    };

    expect(hasResponseData(validError)).toBe(true);
  });

  it('should return false for null', () => {
    expect(hasResponseData(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(hasResponseData(undefined)).toBe(false);
  });

  it('should return false for primitive types', () => {
    expect(hasResponseData('string')).toBe(false);
    expect(hasResponseData(123)).toBe(false);
    expect(hasResponseData(true)).toBe(false);
    expect(hasResponseData(false)).toBe(false);
  });

  it('should return false for objects missing response property', () => {
    const invalidError = {
      someOtherProperty: 'value',
    };

    expect(hasResponseData(invalidError)).toBe(false);
  });

  it('should return false for objects with null response', () => {
    const invalidError = {
      response: null,
    };

    expect(hasResponseData(invalidError)).toBe(false);
  });

  it('should return false for objects with undefined response', () => {
    const invalidError = {
      response: undefined,
    };

    expect(hasResponseData(invalidError)).toBe(false);
  });

  it('should return false for objects with non-object response', () => {
    const invalidError = {
      response: 'not an object',
    };

    expect(hasResponseData(invalidError)).toBe(false);
  });

  it('should return false for objects with response missing data property', () => {
    const invalidError = {
      response: {
        someOtherProperty: 'value',
      },
    };

    expect(hasResponseData(invalidError)).toBe(false);
  });

  it('should return true for objects with response.data as null', () => {
    const validError = {
      response: {
        data: null,
      },
    };

    expect(hasResponseData(validError)).toBe(true);
  });

  it('should return true for objects with response.data as undefined', () => {
    const validError = {
      response: {
        data: undefined,
      },
    };

    expect(hasResponseData(validError)).toBe(true);
  });

  it('should return true for objects with response.data as primitive values', () => {
    const validError1 = {
      response: {
        data: 'string data',
      },
    };

    const validError2 = {
      response: {
        data: 123,
      },
    };

    const validError3 = {
      response: {
        data: true,
      },
    };

    expect(hasResponseData(validError1)).toBe(true);
    expect(hasResponseData(validError2)).toBe(true);
    expect(hasResponseData(validError3)).toBe(true);
  });

  it('should return true for objects with response.data as complex objects', () => {
    const validError = {
      response: {
        data: {
          nested: {
            property: 'value',
          },
          array: [1, 2, 3],
        },
      },
    };

    expect(hasResponseData(validError)).toBe(true);
  });

  it('should return false for empty objects', () => {
    expect(hasResponseData({})).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(hasResponseData([])).toBe(false);
    expect(hasResponseData([1, 2, 3])).toBe(false);
  });
});

describe('validateTestEnvironment', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('should return header value when REACT_APP_RUUTER_SERVICES_TESTING_HEADER is set', () => {
    const testHeaderValue = 'test-header-value';
    vi.stubEnv('REACT_APP_RUUTER_SERVICES_TESTING_HEADER', testHeaderValue);

    const result = validateTestEnvironment();

    expect(result).toBe(testHeaderValue);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should return null when REACT_APP_RUUTER_SERVICES_TESTING_HEADER is not set', () => {
    // Don't set the environment variable at all

    const result = validateTestEnvironment();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'runServiceTest: REACT_APP_RUUTER_SERVICES_TESTING_HEADER value is not set, not testing.',
    );
  });

  it('should return header value when REACT_APP_RUUTER_SERVICES_TESTING_HEADER contains special characters', () => {
    const testHeaderValue = 'test-header-with-special-chars!@#$%^&*()';
    vi.stubEnv('REACT_APP_RUUTER_SERVICES_TESTING_HEADER', testHeaderValue);

    const result = validateTestEnvironment();

    expect(result).toBe(testHeaderValue);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should return header value when REACT_APP_RUUTER_SERVICES_TESTING_HEADER is a long string', () => {
    const testHeaderValue = 'a'.repeat(1000);
    vi.stubEnv('REACT_APP_RUUTER_SERVICES_TESTING_HEADER', testHeaderValue);

    const result = validateTestEnvironment();

    expect(result).toBe(testHeaderValue);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe('clearPreviousTestStates', () => {
  it('should set testingPassed to true for all nodes', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: false,
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: null,
        },
      },
      {
        id: 'node3',
        data: {
          label: 'Test Node 3',
          testingPassed: true,
        },
      },
    ];

    clearPreviousTestStates(mockServiceStore as unknown as ServiceStoreState);

    expect(mockServiceStore.setNodes).toHaveBeenCalledWith(expect.any(Function));

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result).toEqual([
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: true,
        },
      },
      {
        id: 'node3',
        data: {
          label: 'Test Node 3',
          testingPassed: true,
        },
      },
    ]);
  });

  it('should preserve all other node properties', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: {
          label: 'Test Node',
          type: 'custom',
          stepType: 'ASSIGN',
          readonly: false,
          childrenCount: 0,
          testingPassed: false,
          endpoint: { id: 'endpoint1', name: 'Test Endpoint' },
        },
      },
    ];

    clearPreviousTestStates(mockServiceStore as unknown as ServiceStoreState);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result[0]).toEqual({
      id: 'node1',
      type: 'custom',
      position: { x: 100, y: 200 },
      data: {
        label: 'Test Node',
        type: 'custom',
        stepType: 'ASSIGN',
        readonly: false,
        childrenCount: 0,
        testingPassed: true,
        endpoint: { id: 'endpoint1', name: 'Test Endpoint' },
      },
    });
  });

  it('should handle empty nodes array', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    clearPreviousTestStates(mockServiceStore as unknown as ServiceStoreState);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback([]);

    expect(result).toEqual([]);
  });

  it('should handle nodes without testingPassed property', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: false,
        },
      },
    ];

    clearPreviousTestStates(mockServiceStore as unknown as ServiceStoreState);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result).toEqual([
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: true,
        },
      },
    ]);
  });
});

describe('executeServiceTest', () => {
  let mockCreateApiInstance: ReturnType<typeof vi.fn>;
  let mockTestService: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPost = vi.fn();
    mockCreateApiInstance = vi.mocked((await import('./api')).createApiInstance);
    mockTestService = vi.mocked((await import('resources/api-constants')).testService);

    mockCreateApiInstance.mockReturnValue({
      post: mockPost,
    } as any);
    mockTestService.mockReturnValue('/test-endpoint');
  });

  it('should call createApiInstance with correct header', async () => {
    const headerValue = 'test-header';
    const state = ServiceState.Active;
    const name = 'test-service';
    const input = 'test-input';

    await executeServiceTest(headerValue, state, name, input);

    expect(mockCreateApiInstance).toHaveBeenCalledWith({
      'x-ruuter-testing': headerValue,
    });
  });

  it('should call testService with correct parameters', async () => {
    const headerValue = 'test-header';
    const state = ServiceState.Active;
    const name = 'test-service';
    const input = 'test-input';

    await executeServiceTest(headerValue, state, name, input);

    expect(mockTestService).toHaveBeenCalledWith(state, name);
  });

  it('should call post with correct endpoint and payload', async () => {
    const headerValue = 'test-header';
    const state = ServiceState.Active;
    const name = 'test-service';
    const input = 'test-input';
    const expectedEndpoint = '/test-endpoint';

    await executeServiceTest(headerValue, state, name, input);

    expect(mockPost).toHaveBeenCalledWith(expectedEndpoint, { input });
  });

  it('should return the result from post call', async () => {
    const headerValue = 'test-header';
    const state = ServiceState.Active;
    const name = 'test-service';
    const input = 'test-input';
    const expectedResponse = { success: true, data: 'test-data' };

    mockPost.mockResolvedValue(expectedResponse);

    const result = await executeServiceTest(headerValue, state, name, input);

    expect(result).toBe(expectedResponse);
  });
});

describe('updateNodeTestState', () => {
  it('should update testingPassed for the specified node', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: false,
        },
      },
      {
        id: 'node3',
        data: {
          label: 'Test Node 3',
          testingPassed: null,
        },
      },
    ];

    updateNodeTestState(mockServiceStore as unknown as ServiceStoreState, 'node2', true);

    expect(mockServiceStore.setNodes).toHaveBeenCalledWith(expect.any(Function));

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result).toEqual([
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: true,
        },
      },
      {
        id: 'node3',
        data: {
          label: 'Test Node 3',
          testingPassed: null,
        },
      },
    ]);
  });

  it('should set testingPassed to false when passed is false', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
        },
      },
    ];

    updateNodeTestState(mockServiceStore as unknown as ServiceStoreState, 'node1', false);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result[0].data.testingPassed).toBe(false);
  });

  it('should not modify other nodes when updating a specific node', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
          testingPassed: true,
          otherProperty: 'value1',
        },
      },
      {
        id: 'node2',
        data: {
          label: 'Test Node 2',
          testingPassed: false,
          otherProperty: 'value2',
        },
      },
    ];

    updateNodeTestState(mockServiceStore as unknown as ServiceStoreState, 'node1', false);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    // node1 should be updated
    expect(result[0].data.testingPassed).toBe(false);
    expect(result[0].data.otherProperty).toBe('value1');

    // node2 should remain unchanged
    expect(result[1].data.testingPassed).toBe(false);
    expect(result[1].data.otherProperty).toBe('value2');
  });

  it('should preserve all other node properties when updating', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: {
          label: 'Test Node',
          type: 'custom',
          stepType: 'ASSIGN',
          readonly: false,
          childrenCount: 0,
          testingPassed: true,
          endpoint: { id: 'endpoint1', name: 'Test Endpoint' },
        },
      },
    ];

    updateNodeTestState(mockServiceStore as unknown as ServiceStoreState, 'node1', false);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result[0]).toEqual({
      id: 'node1',
      type: 'custom',
      position: { x: 100, y: 200 },
      data: {
        label: 'Test Node',
        type: 'custom',
        stepType: 'ASSIGN',
        readonly: false,
        childrenCount: 0,
        testingPassed: false,
        endpoint: { id: 'endpoint1', name: 'Test Endpoint' },
      },
    });
  });

  it('should handle nodes without testingPassed property', () => {
    const mockServiceStore = {
      setNodes: vi.fn(),
    };

    const mockNodes = [
      {
        id: 'node1',
        data: {
          label: 'Test Node 1',
        },
      },
    ];

    updateNodeTestState(mockServiceStore as unknown as ServiceStoreState, 'node1', true);

    const setNodesCallback = mockServiceStore.setNodes.mock.calls[0][0];
    const result = setNodesCallback(mockNodes);

    expect(result[0].data.testingPassed).toBe(true);
    expect(result[0].data.label).toBe('Test Node 1');
  });
});

describe('handleTestError', () => {
  let mockServiceStore: any;
  let mockTestStore: any;
  let mockFromSnakeCase: any;
  let mockAddError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAddError = vi.fn();
    mockServiceStore = {
      nodes: [
        {
          id: 'node1',
          data: { label: 'test_step' },
        },
      ],
      setNodes: vi.fn(),
    };
    mockTestStore = vi.mocked((await import('store/test-services.store')).default);
    mockTestStore.getState.mockReturnValue({ addError: mockAddError });
    mockFromSnakeCase = vi.mocked((await import('utils/string-util')).fromSnakeCase);
  });

  it('should handle error with response data and valid error response', () => {
    const error = {
      response: {
        data: {
          stepName: 'test_step',
          causeCode: 'E_unknown',
          message: 'Test error',
        },
      },
    };

    handleTestError(error, mockServiceStore as unknown as ServiceStoreState);

    expect(mockAddError).toHaveBeenCalledWith('chat.service-test-error.title', expect.any(Object));
    expect(mockFromSnakeCase).toHaveBeenCalledWith('test_step');
  });

  it('should handle error without response data', () => {
    const error = new Error('Network error');

    handleTestError(error, mockServiceStore as unknown as ServiceStoreState);

    expect(mockAddError).toHaveBeenCalledWith('chat.unknown-error');
  });

  it('should handle error with response data but invalid error response format', () => {
    const error = {
      response: {
        data: {
          someOtherProperty: 'value',
        },
      },
    };

    handleTestError(error, mockServiceStore as unknown as ServiceStoreState);

    expect(mockAddError).toHaveBeenCalledWith('chat.unknown-error');
  });

  it('should handle error when node is not found', () => {
    const error = {
      response: {
        data: {
          stepName: 'non_existent_step',
          causeCode: 'E_unknown',
          message: 'Test error',
        },
      },
    };

    handleTestError(error, mockServiceStore as unknown as ServiceStoreState);

    expect(mockAddError).toHaveBeenCalledWith('chat.unknown-error');
  });
});
