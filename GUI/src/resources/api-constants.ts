
const baseUrl = import.meta.env.REACT_APP_API_URL;
const trainingModuleBaseUrl = import.meta.env.REACT_APP_TRAINING_MODULE_GUI_BASE_URL;

export const getServicesAdd = (): string => `${baseUrl}/services/add`;
export const getOpenApiSpec = (): string => `${baseUrl}/services/open-api-spec`;
export const servicesRequestsExplain = (): string => `${baseUrl}/services/requests/explain`;
export const getSecretVariables = (): string => `${baseUrl}/secrets`;
export const getDomainFile = (): string => `${baseUrl}/domain-file`;
export const getServiceSettings = (): string => `${baseUrl}/service-settings`;
export const saveServiceSettings = (): string => `${baseUrl}/service-settings`;
export const getTaraAuthResponseVariables = (): string => `${baseUrl}/mocks/tim/user-info`;
export const getEndpointValidationMock = (): string => `${baseUrl}/mocks/validation-mock`;
export const getEndpointValidation = (): string => `${baseUrl}/services/endpoint-url-validation`;
export const deleteService = (): string => `${baseUrl}/services/delete`;
export const changeServiceStatus = (): string => `${baseUrl}/services/status`;
export const createNewService = (): string => `${baseUrl}/services/add`;
export const testDraftService = (serviceName: string): string => `${baseUrl}/services/draft/${serviceName}`;
export const getServicesList = (): string => `${baseUrl}/services`;
export const jsonToYml = (): string => `${baseUrl}/saveJsonToYml`;
export const getFaultyServices = (): string => `${baseUrl}/overview/services-detailed/nok`;
export const trainingModuleTraining = (): string => `${trainingModuleBaseUrl}/treening/treeni-uus-mudel`;
