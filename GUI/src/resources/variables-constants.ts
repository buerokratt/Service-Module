import { Assign } from 'types';
import { HELPERS_CONSTANTS } from 'utils/constants';
import { stringToTemplate } from 'utils/string-util';
import { v4 } from 'uuid';

const createTemplate = (
  id: string,
  key: string,
  value: string,
  tooltip: string | undefined = undefined,
  valueFormat: 'plain' | 'formatted' = 'formatted',
): Assign => ({
  id,
  key,
  value: valueFormat === 'formatted' ? stringToTemplate(value) : value,
  tooltip,
});

const helpersTrPath = 'serviceFlow.previousVariables.helpers';

export const helperVariables: Assign[] = [
  createTemplate(v4(), `${helpersTrPath}.map`, HELPERS_CONSTANTS.MAP),
  createTemplate(v4(), `${helpersTrPath}.filter`, HELPERS_CONSTANTS.FILTER),
  createTemplate(v4(), `${helpersTrPath}.find`, HELPERS_CONSTANTS.FIND),
  createTemplate(v4(), `${helpersTrPath}.length`, HELPERS_CONSTANTS.LENGTH),
  createTemplate(v4(), `${helpersTrPath}.sort`, HELPERS_CONSTANTS.SORT),
  createTemplate(v4(), `${helpersTrPath}.join`, HELPERS_CONSTANTS.JOIN),
  createTemplate(v4(), `${helpersTrPath}.split`, HELPERS_CONSTANTS.SPLIT),
  createTemplate(v4(), `${helpersTrPath}.slice`, HELPERS_CONSTANTS.SLICE),
  createTemplate(v4(), `${helpersTrPath}.reduce`, HELPERS_CONSTANTS.REDUCE),
  createTemplate(v4(), `${helpersTrPath}.mapAndJoin`, HELPERS_CONSTANTS.MAP_AND_JOIN),
];

export const environmentVariables: Assign[] = [
  createTemplate(v4(), 'XTR', '[#XTR]', undefined, 'plain'),
  createTemplate(v4(), 'Open Search', '[#OPENSEARCH]', undefined, 'plain'),
];
