const baseUrl = process.env.REACT_APP_API_URL;

export const dummyDataApi = (): string => {
  return baseUrl + "/testing";
};

// Services
export const getServicesAdd = (): string => `${baseUrl}/services/add`;

export const dummyServiceData = [
  { name: "first", usedCount: 1, state: "inactive" },
  { name: "second", usedCount: 20, state: "active" },
  { name: "third", usedCount: 3000, state: "inactive" },
  { name: "fourth", usedCount: 4000, state: "active" },
  { name: "fifth", usedCount: 500000, state: "active" },
  { name: "sixth", usedCount: 6000000, state: "active" },
  { name: "seventh", usedCount: 70000000, state: "active" },
  { name: "eight", usedCount: 800000000, state: "active" },
  { name: "ninth", usedCount: 900000000, state: "active" },
  { name: "tenth", usedCount: 10000000000, state: "active" },
  { name: "eleventh", usedCount: 11, state: "inactive" },
];
