export const isTemplate = (value: string | number) => {
  return String(value).startsWith("${") && String(value).endsWith("}");
};

export const stringToTemplate = (value: string | number) => {
  return "${" + value + "}";
};

export const templateToString = (value: string | number) => {
  const valueString = String(value);
  if (!isTemplate(value)) throw new Error("Input is not a template");

  return valueString.substring(2, valueString.length - 1);
};
