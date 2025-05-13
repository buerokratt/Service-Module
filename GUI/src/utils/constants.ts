import { useTranslation } from "react-i18next";

export enum DATE_CONSTANTS {
  TODAY = "new Date().toISOString().split('T')[0]",
  CURRENT_TIME = "new Date().toISOString().split('T')[1].replace('Z', '')",
  NOW = "new Date().toISOString()",
  YESTERDAY = "new Date(Date.now() - 86400000).toISOString().split('T')[0]",
  TOMORROW = "new Date(Date.now() + 86400000).toISOString().split('T')[0]",
  CUSTOM = "new Date(YOUR_DATE).toISOString()",
  DMY = "new Intl.DateTimeFormat('en-GB').format(Date.now()).replaceAll('/','-')",
  CUSTOM_FORMAT = "MM,dd,yyyy, h:mm:ss a.replaceAll('yyyy', YOUR_DATE.getFullYear()).replaceAll('MMM', monthNames[YOUR_DATE.getMonth() - 2]).replaceAll('MM', String(YOUR_DATE.getMonth() + 1).padStart(2, '0')).replaceAll('dd', String(YOUR_DATE.getDate()).padStart(2, '0')).replaceAll('h', YOUR_DATE.getHours() % 12 || 12).replaceAll('hh', String(YOUR_DATE.getHours() % 12 || 12).padStart(2, '0')).replaceAll('HH', String(YOUR_DATE.getHours() % 24 || 24).padStart(2, '0')).replaceAll('mm', String(YOUR_DATE.getMinutes()).padStart(2, '0')).replaceAll('ss', String(YOUR_DATE.getSeconds()).padStart(2, '0')).replaceAll(' a', YOUR_DATE.getHours() < 12 ? ' AM' : ' PM')",
};

export enum HELPERS_CONSTANTS {
  MAP = "YOUR_LIST.map((item: any) => item.value)",
  FILTER = "YOUR_LIST.filter((item: any) => item.value === YOUR_VALUE)",
  FIND = "YOUR_LIST.find((item: any) => item.value === YOUR_VALUE)",
  LENGTH = "YOUR_LIST.length",
  SORT = "YOUR_LIST.sort()",
  JOIN = "YOUR_LIST.join(',')",
  SPLIT = "YOUR_TEXT.split(',')",
  SLICE = "YOUR_LIST.slice(START_INDEX, END_INDEX)",
  REDUCE = "YOUR_LIST.reduce((str, item, i) => str + (i ? 'YOUR_DELIMITER' : '') + item, 'YOUR_INITIAL_VALUE')",
  MAP_AND_JOIN = "YOUR_LIST.map((item) => item).join('YOUR_DELIMITER')",
};

export const getHelperTooltips = () => {
  const { t } = useTranslation();
  return [
    t("serviceFlow.previousVariables.helpers.tooltip.map", {
      example: "list.map(x ARROW x * 2)",
      input: "[1, 2, 3]",
      output: "[2, 4, 6]",
    }).replace("ARROW", "=>") ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.filter", {
      example: "list.filter(x ARROW x BIGGER 10)",
      input: "[5, 10, 15, 20]",
      output: "[15, 20]",
    })
      .replace("ARROW", "=>")
      .replace("BIGGER", ">") ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.find", {
      example: "list.find(x ARROW x.id === 2)",
      input: "[{id: 1}, {id: 2}]",
      output: "{id: 2}",
    }).replace("ARROW", "=>") ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.length", {
      example: "list.length",
      input: "[a, b, c]",
      output: "3",
    }) ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.sort", {
      example: "list.sort()",
      input: "[3, 1, 2]",
      output: "[1, 2, 3]",
    }) ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.join", {
      example: "list.join( , )",
      input: "[a, b, c]",
      output: "a, b, c",
    }) ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.split", {
      example: "text.split( , )",
      input: "one,two,three",
      output: "[one, two, three]",
    }) ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.slice", {
      example: "list.slice(1, 4)",
      input: "[10, 20, 30, 40, 50]",
      output: "[20, 30, 40]",
    }) ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.reduce", {
      example: "list.reduce((total, num) ARROW total + num, 0)",
      input: "[1, 2, 3, 4, 5]",
      output: "15",
      example2: "list.reduce((flat, row) ARROW flat.concat(row), [])",
      input2: "[[1, 2], [3, 4], [5, 6]]",
      output2: "[1, 2, 3, 4, 5, 6]",
      example3:
        "list.reduce((str, item, i) ARROW str + (i ? \\n : ``) + item.startDate +  -  + item.name[0].text, Kõik riigipühad käesoleval aastal on:\\n)",
      input3:
        "[ { startDate: 2025-01-01, name: [{language: EE, text: uusaasta}] }, { startDate: 2025-02-24, name: [{language: EE, text: iseseisvuspäev}] } ]",
      output3: "Kõik riigipühad käesoleval aastal on:\n2025-01-01 - uusaasta\n2025-02-24 - iseseisvuspäev",
    }).replaceAll("ARROW", "=>") ?? "",
    t("serviceFlow.previousVariables.helpers.tooltip.mapAndJoin", {
      example:
        "Kõik riigipühad käesoleval aastal on:\n${list.map((item) ARROW item.startDate +  -  + item.name[0].text).join(\\n)}",
      input:
        "[ { startDate: 2025-01-01, name: [{language: EE, text: uusaasta}] }, { startDate: 2025-02-24, name: [{language: EE, text: iseseisvuspäev}] } ]",
      output: "Kõik riigipühad käesoleval aastal on:\n2025-01-01 - uusaasta\n2025-02-24 - iseseisvuspäev",
    }).replace("ARROW", "=>") ?? "",
  ];
};
