import { ServiceState } from "../types/service-state";

const baseUrl = process.env.REACT_APP_API_URL;

export const dummyDataApi = (): string => {
  return baseUrl + "/testing";
};

// Services
export const getServicesAdd = (): string => `${baseUrl}/services/add`;

export const dummyEndpointsData = [
  { label: "/me", value: "/me" },
  { label: "/you", value: "/you" },
];

export const dummyVariablesData = [
  { variable: "first", value: "1", required: true },
  { variable: "second", value: "20", required: true },
  { variable: "third", value: "3000", required: false },
  { variable: "fourth", value: "4000", required: false },
  { variable: "fifth", value: "500000", required: true },
  { variable: "sixth", value: "6000000", required: false },
  { variable: "seventh", value: "70000000", required: false },
  { variable: "eight", value: "800000000", required: true },
  { variable: "ninth", value: "900000000", required: true },
  { variable: "tenth", value: "10000000000", required: false },
  { variable: "eleventh", value: "11", required: false },
];

export const dummyVariableOptions = [
  { label: "0", value: "0" },
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
  { label: "40", value: "40" },
  { label: "50", value: "50" },
  { label: "60", value: "60" },
];

// Mocks
export const getOpenApiSpec = (): string => `${baseUrl}/services/open-api-spec`;
export const servicesRequestsExplain = (): string => `${baseUrl}/services/requests/explain`;
export const getClientInputAvailableVariables = (): string => `${baseUrl}/mocks/client-input-variables`;
export const getSecretVariables = (): string => `${baseUrl}/secrets`;
export const getDomainFile = (): string => `${baseUrl}/domain-file`;
export const getServiceSettings = (): string => `${baseUrl}/mocks/service-settings`;
export const saveServiceSettings = (): string => `${baseUrl}/mocks/service-settings`;
export const getTaraAuthResponseVariables = (): string => `${baseUrl}/mocks/tim/user-info`;
export const getEndpointValidationMock = (): string => `${baseUrl}/mocks/validation-mock`;
export const deleteService = (): string => `${baseUrl}/services/delete`;
export const changeServiceStatus = (): string => `${baseUrl}/services/status`;
export const createNewService = (): string => `${baseUrl}/services/add`;
export const getServicesList = (): string => `${baseUrl}/services`;
export const jsonToYml = (): string => `${baseUrl}/saveJsonToYml`;
