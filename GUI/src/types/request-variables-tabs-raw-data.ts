import { EndpointTab } from "./endpoint-tab.enum";

export type RequestVariablesTabsRawData = {
  [tab in EndpointTab]?: string;
};
