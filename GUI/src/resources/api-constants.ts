import { ServiceStatus } from "../types/service-status";

const baseUrl = process.env.REACT_APP_API_URL;

export const dummyDataApi = (): string => {
  return baseUrl + "/testing";
};

// Services
export const getServicesAdd = (): string => `${baseUrl}/services/add`;

export const dummyServiceData = [
  { name: "first", usedCount: 1, state: ServiceStatus.Inactive },
  { name: "second", usedCount: 20, state: ServiceStatus.Active },
  { name: "third", usedCount: 3000, state: ServiceStatus.Inactive },
  { name: "fourth", usedCount: 4000, state: ServiceStatus.Active },
  { name: "fifth", usedCount: 500000, state: ServiceStatus.Active },
  { name: "sixth", usedCount: 6000000, state: ServiceStatus.Active },
  { name: "seventh", usedCount: 70000000, state: ServiceStatus.Inactive },
  { name: "eight", usedCount: 800000000, state: ServiceStatus.Active },
  { name: "ninth", usedCount: 900000000, state: ServiceStatus.Active },
  { name: "tenth", usedCount: 10000000000, state: ServiceStatus.Active },
  { name: "eleventh", usedCount: 11, state: ServiceStatus.Inactive },
];
