import { ServiceState } from "types";

const baseUrl = import.meta.env.REACT_APP_API_URL;
const trainingModuleBaseUrl = import.meta.env.REACT_APP_TRAINING_MODULE_GUI_BASE_URL;

export const getOpenApiSpec = (): string => `${baseUrl}/services/open-api-spec`;
export const servicesRequestsExplain = (): string => `${baseUrl}/services/requests/explain`;
export const getSecretVariables = (): string => `${baseUrl}/secrets`;
export const getDomainFile = (): string => `${baseUrl}/domain-file`;
export const getServiceSettings = (): string => `${baseUrl}/service-settings`;
export const saveServiceSettings = (): string => `${baseUrl}/service-settings`;
export const getTaraAuthResponseVariables = (): string => `${baseUrl}/user-info`;
export const getEndpointValidationMock = (): string => `${baseUrl}/mocks/validation-mock`;
export const getEndpointValidation = (): string => `${baseUrl}/services/endpoint-url-validation`;
export const deleteService = (): string => `${baseUrl}/services/delete`;
export const changeServiceStatus = (): string => `${baseUrl}/services/status`;
export const changeIntentConnection = (): string => `${baseUrl}/services/check-intent-connection`;
export const requestServiceIntentConnection = (): string => `${baseUrl}/services/request-service-intent-connection`;
export const respondToConnectionRequest = (): string => `${baseUrl}/services/respond-to-connection-request`;
export const createNewService = (): string => `${baseUrl}/services/add`;
export const testService = (state: ServiceState, serviceName: string): string =>
  `${baseUrl}/services/${state.toLowerCase()}/${serviceName}`;
export const editService = (id: string): string => `${baseUrl}/services/edit?id=${id}`;
export const getServicesList = (): string => `${baseUrl}/services`;
export const getCommonServicesList = (): string => `${baseUrl}/common-services`;
export const getConnectionRequests = (): string => `${baseUrl}/services/connection-requests`;
export const getAvailableIntents = (): string => `${baseUrl}/services/available-intents`;
export const jsonToYml = (): string => `${baseUrl}/saveJsonToYml`;
export const getFaultyServices = (): string => `${baseUrl}/services/services-detailed/nok`;
export const trainingModuleTraining = (): string => `${trainingModuleBaseUrl}/treening/treeni-uus-mudel`;
export const getServiceById = (id: string): string => `${baseUrl}/service-by-id?id=${id}`;
export const updateServiceEndpoints = (id: string): string => `${baseUrl}/services/update-service-endpoints?id=${id}`;
