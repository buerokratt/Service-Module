import { useTranslation } from "react-i18next";
import { Assign } from "types";
import { DATE_CONSTANTS, HELPER_TOOLTIPS, HELPERS_CONSTANTS } from "utils/constants";
import { stringToTemplate } from "utils/string-util";
import { v4 } from "uuid";

const createTemplate = (id: string, key: string, value: string, tooltip: string | undefined = undefined): Assign => ({
  id,
  key,
  value: stringToTemplate(value),
  tooltip,
});

const { t } = useTranslation();

export const datesVariables: Assign[] = [
  createTemplate(v4(), "current date", DATE_CONSTANTS.TODAY),
  createTemplate(v4(), "current time", DATE_CONSTANTS.CURRENT_TIME),
  createTemplate(v4(), "current date & time", DATE_CONSTANTS.NOW),
  createTemplate(v4(), "yesterday", DATE_CONSTANTS.YESTERDAY),
  createTemplate(v4(), "tomorrow", DATE_CONSTANTS.TOMORROW),
  createTemplate(v4(), "custom date time", DATE_CONSTANTS.CUSTOM),
  createTemplate(v4(), "Year Month Day format", DATE_CONSTANTS.TODAY),
  createTemplate(v4(), "Day Month Year format", DATE_CONSTANTS.DMY),
  createTemplate(v4(), "Custom Format", DATE_CONSTANTS.CUSTOM_FORMAT),
];

export const helperVariables: Assign[] = [
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.map"), HELPERS_CONSTANTS.MAP, HELPER_TOOLTIPS.MAP),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.filter"), HELPERS_CONSTANTS.FILTER, HELPER_TOOLTIPS.FILTER),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.find"), HELPERS_CONSTANTS.FIND, HELPER_TOOLTIPS.FIND),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.length"), HELPERS_CONSTANTS.LENGTH, HELPER_TOOLTIPS.LENGTH),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.sort"), HELPERS_CONSTANTS.SORT, HELPER_TOOLTIPS.SORT),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.join"), HELPERS_CONSTANTS.JOIN, HELPER_TOOLTIPS.JOIN),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.split"), HELPERS_CONSTANTS.SPLIT, HELPER_TOOLTIPS.SPLIT),
  createTemplate(v4(), t("serviceFlow.previousVariables.helpers.slice"), HELPERS_CONSTANTS.SLICE, HELPER_TOOLTIPS.SLICE),
];


