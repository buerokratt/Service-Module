export const ROUTES = {
  OVERVIEW_ROUTE: "/overview",
  FLOW_ROUTE: "/flow/:id",
  NEWSERVICE_ROUTE: "/newService",
  NEWSERVICE_ROUTE_WITH_INTENT_NAME: "/newService/:intentName",
  EDITSERVICE_ROUTE: "/edit/:id",
  FOLLOWUPTRAINING_ROUTE: "/followupTraining",
  FAULTY_SERVICES_ROUTE: "/faultyServices",
  SERVICE_SETTINGS: "/services/settings",
  
  replaceWithId(route: string, id: string | number | undefined) {
    id = id ?? "";
    return route.replace(":id", id.toString());
  },
};
