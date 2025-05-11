import { Assign } from "types";
import { DATE_CONSTANTS, HELPERS_CONSTANTS } from "utils/constants";
import { stringToTemplate } from "utils/string-util";
import { v4 } from "uuid";

const createTemplate = (id: string, key: string, value: string, tooltip: string | undefined = undefined): Assign => ({
  id,
  key,
  value: stringToTemplate(value),
  tooltip,
});

const datesTrPath = "serviceFlow.previousVariables.dates";
const helperTrPath = "serviceFlow.previousVariables.helpers";

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
  createTemplate(v4(), `${helperTrPath}.map`, HELPERS_CONSTANTS.MAP),
  createTemplate(v4(), `${helperTrPath}.filter`, HELPERS_CONSTANTS.FILTER),
  createTemplate(v4(), `${helperTrPath}.find`, HELPERS_CONSTANTS.FIND),
  createTemplate(v4(), `${helperTrPath}.length`, HELPERS_CONSTANTS.LENGTH),
  createTemplate(v4(), `${helperTrPath}.sort`, HELPERS_CONSTANTS.SORT),
  createTemplate(v4(), `${helperTrPath}.join`, HELPERS_CONSTANTS.JOIN),
  createTemplate(v4(), `${helperTrPath}.split`, HELPERS_CONSTANTS.SPLIT),
  createTemplate(v4(), `${helperTrPath}.slice`, HELPERS_CONSTANTS.SLICE),
];


