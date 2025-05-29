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
