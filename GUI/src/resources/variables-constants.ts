import { Assign } from 'types';
import { DATE_CONSTANTS, HELPERS_CONSTANTS } from 'utils/constants';
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

const datesTrPath = 'serviceFlow.previousVariables.dates';
const helpersTrPath = 'serviceFlow.previousVariables.helpers';

export const datesVariables: Assign[] = [
  createTemplate(v4(), `${datesTrPath}.currentDate`, DATE_CONSTANTS.TODAY),
  createTemplate(v4(), `${datesTrPath}.currentTime`, DATE_CONSTANTS.CURRENT_TIME),
  createTemplate(v4(), `${datesTrPath}.currentDateAndTime`, DATE_CONSTANTS.NOW),
  createTemplate(v4(), `${datesTrPath}.yesterday`, DATE_CONSTANTS.YESTERDAY),
  createTemplate(v4(), `${datesTrPath}.tomorrow`, DATE_CONSTANTS.TOMORROW),
  createTemplate(v4(), `${datesTrPath}.customDateTime`, DATE_CONSTANTS.CUSTOM),
  createTemplate(v4(), `${datesTrPath}.yearMonthDayFormat`, DATE_CONSTANTS.TODAY),
  createTemplate(v4(), `${datesTrPath}.dayMonthYearFormat`, DATE_CONSTANTS.DMY),
  createTemplate(v4(), `${datesTrPath}.customFormat`, DATE_CONSTANTS.CUSTOM_FORMAT),
];

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
