export const isTemplate = (value: string | number) => {
  return String(value).startsWith("${") && String(value).endsWith("}");
};

export const stringToTemplate = (value: string | number) => {
  return "${" + value + "}";
};

export const templateToString = (value: string | number) => {
  const valueString = String(value);
  if (!isTemplate(value)) {
    console.error(`templateToString: input '${value}' is not a template, returning input as is`);
    return valueString;
  }

  return valueString.substring(2, valueString.length - 1);
};

export const toSnakeCase = (value: string) => {
  return value.toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_").replace(/_+/g, "_").trim();
};

export const getLastDigits = (value: string) => {
  const match = RegExp(/(\d+)$/).exec(value);
  return match ? parseInt(match[0], 10) : 1;
};
