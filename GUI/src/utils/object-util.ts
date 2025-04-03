export const getValueByPath = (obj: unknown, path: string) => {
  if (!isObject(obj)) return obj;

  const keys = path.split(".");
  let result = obj;

  for (let key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    // Handle array notation properly, needed for backwards compatibility
    if (key.match(/^\[(\d+)\]$/)) {
      // Extract the index from [n] format
      const index = parseInt(key.substring(1, key.length - 1));
      if (Array.isArray(result)) {
        result = result[index];
      } else {
        return undefined;
      }
    }
    // Handle mixed notation like "items[0]"
    else if (key.includes("[") && key.endsWith("]")) {
      const propName = key.substring(0, key.indexOf("["));
      const indexStr = key.substring(key.indexOf("[") + 1, key.length - 1);
      const index = parseInt(indexStr);

      if (isObject(result) && propName in (result as Record<string, unknown>)) {
        const propValue = (result as Record<string, unknown>)[propName];
        if (Array.isArray(propValue) && !isNaN(index)) {
          result = propValue[index];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } else {
      const index = Number(key);
      if (!isNaN(index) && Array.isArray(result)) {
        result = result[index];
      } else if (isObject(result) && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, object>)[key];
      } else {
        return undefined;
      }
    }
  }

  return result;
};

export const isObject = (x: unknown) => {
  return typeof x === "object" && x !== null;
};

export const getTypeColor = (value: any): { type: string; color: string } => {
  switch (true) {
    case value === null || value === undefined:
      return { type: "null/undefined", color: "#A1A1A1" };
    case typeof value === "string":
      return { type: "string", color: "#FF6F61" };
    case typeof value === "number":
      return { type: "number", color: "#6BDB75" };
    case value instanceof Date:
      return { type: "date", color: "#FFC145" };
    case Array.isArray(value):
      return { type: "array", color: "#64C1FF" };
    case typeof value === "object":
      return { type: "object", color: "#8E6CE8" };
    default:
      return { type: "unknown", color: "#FFFFFF" };
  }
}