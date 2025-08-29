import { RequestVariablesRowData } from './request-variables-row-data';
import { EndpointTab } from '../endpoint/endpoint-tab.enum';

export type RequestVariablesTabsRowsData = {
  [tab in EndpointTab]?: RequestVariablesRowData[];
};
