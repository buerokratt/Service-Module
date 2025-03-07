export const getValueByPath = (obj: unknown, path: string) => {
  if (!isObject(obj)) return obj;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    const index = Number(key);
    if (!isNaN(index) && Array.isArray(result)) {
      result = result[index];
    } else {
      result = (result as Record<string, object>)[key];
    }
  }

  return result;
};

export const isObject = (x: unknown) => {
  return typeof x === "object" && x !== null;
};
