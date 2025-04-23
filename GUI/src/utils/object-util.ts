import { KeyPath } from "react-json-tree";

export const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!isObject(obj)) return obj;

  const keys = path.split(".");
  let result: unknown = obj;

  for (let key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    const nextResult =
      handleArrayNotation(result, key) ?? handleMixedNotation(result, key) ?? handleSimpleNotation(result, key);

    if (nextResult === undefined) {
      return undefined;
    }

    result = nextResult;
  }

  return result;
};

const handleArrayNotation = (result: unknown, key: string): unknown => {
  const arrayMatch = /^\[(\d+)\]$/.exec(key);
  if (!arrayMatch) return undefined;

  const index = parseInt(arrayMatch[1]);
  return Array.isArray(result) ? result[index] : undefined;
};

const handleMixedNotation = (result: unknown, key: string): unknown => {
  if (!(key.includes("[") && key.endsWith("]"))) return undefined;

  const propName = key.substring(0, key.indexOf("["));
  const indexStr = key.substring(key.indexOf("[") + 1, key.length - 1);
  const index = parseInt(indexStr);

  if (!isObject(result) || !(propName in (result as Record<string, unknown>))) {
    return undefined;
  }

  const propValue = (result as Record<string, unknown>)[propName];
  return Array.isArray(propValue) && !isNaN(index) ? propValue[index] : undefined;
};

const handleSimpleNotation = (result: unknown, key: string): unknown => {
  const index = Number(key);
  if (!isNaN(index) && Array.isArray(result)) {
    return result[index];
  }

  if (isObject(result) && key in (result as Record<string, unknown>)) {
    return (result as Record<string, object>)[key];
  }

  return undefined;
};

export const isObject = (x: unknown) => {
  return typeof x === "object" && x !== null;
};

export const isArray = (x: unknown) => {
  return Array.isArray(x);
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
};

export const getKeyPathString = (keyPath: KeyPath) => {
  return keyPath.toReversed().join('"]["');
};
