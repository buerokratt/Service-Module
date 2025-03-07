export const stringToTemplate = (value: string | number) => {
  return "${" + value + "}";
};

export const templateToString = (value: string | number) => {
  const valueString = String(value);
  if (
    valueString.length < 3 ||
    valueString.substring(0, 2) !== "${" ||
    valueString.charAt(valueString.length - 1) !== "}"
  ) {
    throw new Error("Input is not a template");
  }

  return valueString.substring(2, valueString.length - 1);
};
