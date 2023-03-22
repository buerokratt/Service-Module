import { ServiceState } from "../types/service-state";

const baseUrl = process.env.REACT_APP_API_URL;

export const dummyDataApi = (): string => {
  return baseUrl + "/testing";
};

// Services
export const getServicesAdd = (): string => `${baseUrl}/services/add`;

export const dummyServiceData = [
  { name: "first", usedCount: 1, state: ServiceState.Inactive },
  { name: "second", usedCount: 20, state: ServiceState.Active },
  { name: "third", usedCount: 3000, state: ServiceState.Inactive },
  { name: "fourth", usedCount: 4000, state: ServiceState.Active },
  { name: "fifth", usedCount: 500000, state: ServiceState.Active },
  { name: "sixth", usedCount: 6000000, state: ServiceState.Active },
  { name: "seventh", usedCount: 70000000, state: ServiceState.Inactive },
  { name: "eight", usedCount: 800000000, state: ServiceState.Active },
  { name: "ninth", usedCount: 900000000, state: ServiceState.Active },
  { name: "tenth", usedCount: 10000000000, state: ServiceState.Active },
  { name: "eleventh", usedCount: 11, state: ServiceState.Inactive },
];

// Mocks
export const openApiSpeckMock = (): string =>
  `${baseUrl}/mocks/services/open-api-spec-mock`;
