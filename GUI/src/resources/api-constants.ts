const baseUrl = process.env.REACT_APP_API_URL

export const dummyDataApi = (): string => {
  return baseUrl + '/testing'
}

// Services
export const getServicesAdd = (): string => `${baseUrl}/services/add`;
