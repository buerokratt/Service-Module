export const isTemplate = (value: string | number) => {
  return String(value).startsWith("${") && String(value).endsWith("}");
};

export const stringToTemplate = (value: string | number) => {
  return value ? "${" + value + "}" : '${""}';
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
  return value.toLowerCase().trim().replace(/\s+/g, "_").replace(/-+/g, "_").replace(/_+/g, "_");
};

export const getLastDigits = (value: string) => {
  let lastDigits = "";
  for (let i = value.length - 1; i >= 0; i--) {
    if (/\d/.test(value[i])) {
      lastDigits = value[i] + lastDigits;
    } else {
      break;
    }
  }
  return lastDigits ? parseInt(lastDigits, 10) : 1;
};

export const removeTrailingUnderscores = (value: string) => {
  let end = value.length;
  while (end > 0 && value[end - 1] === "_") end--;
  return value.slice(0, end);
};

export function stringToArray(str: string, fallback: any = []) {
  try {
    if (!str || typeof str !== "string" || str.trim() === "") {
      return fallback;
    }
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}
