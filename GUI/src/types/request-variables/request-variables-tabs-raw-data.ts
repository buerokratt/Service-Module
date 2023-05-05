import { EndpointTab } from "../endpoint/endpoint-tab.enum";

export type RequestVariablesTabsRawData = {
  [tab in EndpointTab]?: string;
};
