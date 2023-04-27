import { EndpointTab } from "../endpoint/endpoint-tab.enum";
import { RequestVariablesRowData } from "./request-variables-row-data";

export type RequestVariablesTabsRowsData = {
  [tab in EndpointTab]?: RequestVariablesRowData[];
};
