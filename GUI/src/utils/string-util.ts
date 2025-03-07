export const stringToTemplate = (value: string | number) => {
  return "${" + value + "}";
};

export const templateToString = (value: string) => {
  if (value.length < 3 || value.substring(0, 2) !== "${" || value.charAt(value.length - 1) !== "}") {
    throw new Error("Input is not a template");
  }

  return value.substring(2, value.length - 1);
};
