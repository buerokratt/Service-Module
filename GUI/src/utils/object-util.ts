import { KeyPath } from 'react-json-tree';

export const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!isObject(obj)) return obj;

  const keys = path.split('.');
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
  if (!(key.includes('[') && key.endsWith(']'))) return undefined;

  const propName = key.substring(0, key.indexOf('['));
  const indexStr = key.substring(key.indexOf('[') + 1, key.length - 1);
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
  return typeof x === 'object' && x !== null;
};

export const isArray = (x: unknown) => {
  return Array.isArray(x);
};

export const getTypeColor = (
  value: unknown,
): { type: 'null/undefined' | 'string' | 'number' | 'date' | 'array' | 'object' | 'unknown'; color: string } => {
  switch (true) {
    case value === null || value === undefined:
      return { type: 'null/undefined', color: '#A1A1A1' };
    case typeof value === 'string':
      return { type: 'string', color: '#FF6F61' };
    case typeof value === 'number':
      return { type: 'number', color: '#6BDB75' };
    case value instanceof Date:
      return { type: 'date', color: '#FFC145' };
    case Array.isArray(value):
      return { type: 'array', color: '#64C1FF' };
    case typeof value === 'object':
      return { type: 'object', color: '#8E6CE8' };
    default:
      return { type: 'unknown', color: '#FFFFFF' };
  }
};

export const getKeyPathString = (keyPath: KeyPath) => {
  return keyPath.toReversed().join('"]["');
};

// Helper function to update value at a specific object path
export const updateValueAtPath = (
  obj: Record<string, unknown> | unknown[],
  path: string,
  newValue: unknown,
): Record<string, unknown> | unknown[] => {
  // Handle empty path - return original object unchanged
  if (!path || path.trim() === '') {
    return obj;
  }

  const pathParts = parsePath(path);

  // Handle case where parsePath returns empty array (shouldn't happen with non-empty path, but safety check)
  if (pathParts.length === 0) {
    return obj;
  }

  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = newObj;

  // Navigate to the parent of the target, creating new objects/arrays for each level
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    const nextPart = pathParts[i + 1];

    // Create new object/array for this level to ensure immutability
    if (current[part] === undefined) {
      current[part] = typeof nextPart === 'number' ? [] : {};
    } else {
      current[part] = cloneValue(current[part]);
    }
    current = current[part];
  }

  // Update the value at the target path
  const lastPart = pathParts[pathParts.length - 1];
  current[lastPart] = newValue;

  return newObj;
};

// Helper function to parse object path into parts
export const parsePath = (path: string): (string | number)[] => {
  const pathParts: (string | number)[] = [];
  let currentPath = path;

  while (currentPath.length > 0) {
    // First, check for array index at the beginning
    const arrayMatch = /^\[(\d+)\]/.exec(currentPath);
    if (arrayMatch) {
      pathParts.push(parseInt(arrayMatch[1]));
      currentPath = currentPath.substring(arrayMatch[0].length);
      continue;
    }

    // Then check for property name followed by array index
    const propertyArrayMatch = /^([^.[\]]+)\[(\d+)\]/.exec(currentPath);
    if (propertyArrayMatch) {
      pathParts.push(propertyArrayMatch[1]); // property name
      pathParts.push(parseInt(propertyArrayMatch[2])); // array index
      currentPath = currentPath.substring(propertyArrayMatch[0].length);
      continue;
    }

    // Check for dot notation
    const dotIndex = currentPath.indexOf('.');
    if (dotIndex === -1) {
      // No more dots, add the remaining part if it's not empty
      if (currentPath.length > 0) {
        pathParts.push(currentPath);
      }
      break;
    } else {
      const part = currentPath.substring(0, dotIndex);
      if (part.length > 0) {
        pathParts.push(part);
      }
      currentPath = currentPath.substring(dotIndex + 1);
    }
  }

  return pathParts;
};

// Helper function to clone value for immutability
const cloneValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (typeof value === 'object' && value !== null) {
    return { ...value };
  }
  return value;
};

// Helper function to search for value in a collection (arrays and objects)
export const searchForValue = (collection: object, value: string, currentPath = ''): string | null => {
  // Convert arrays to entries for unified iteration
  const entries: (string | number)[][] = Array.isArray(collection)
    ? collection.map((val, index) => [index, val])
    : Object.entries(collection);

  // Single loop for both arrays and objects
  for (const [key, objValue] of entries) {
    const newPath = buildPath(currentPath, key);

    if (isStringValueMatch(objValue, value)) return newPath;

    if (isObject(objValue)) {
      const result = searchForValue(objValue, value, newPath);
      if (result) return result;
    }
  }

  return null;
};

// Compares an object value with a string value, handling type conversions for numbers, booleans, and null
// Returns true if the object value matches the string value after appropriate type conversion
export const isStringValueMatch = (objValue: unknown, value: string): boolean => {
  // Handle boolean conversion
  let booleanValue: boolean | null = null;
  if (value.toLowerCase() === 'true') {
    booleanValue = true;
  } else if (value.toLowerCase() === 'false') {
    booleanValue = false;
  }

  return (
    objValue === value ||
    (typeof objValue === 'number' && !isNaN(Number(value)) && objValue === Number(value)) ||
    (typeof objValue === 'boolean' && objValue === booleanValue) ||
    (objValue === null && value.toLowerCase() === 'null')
  );
};

// Helper function to search for a property name in a collection (arrays and objects)
export const searchForProperty = (data: unknown, propertyName: string, currentPath = ''): string | null => {
  if (!isObject(data)) return null;

  // Convert arrays to entries for unified iteration
  const entries: (string | number)[][] = Array.isArray(data)
    ? data.map((val, index) => [index, val])
    : Object.entries(data);

  // Single loop for both arrays and objects
  for (const [key, value] of entries) {
    // Check if this object has the property (for objects only)
    if (!Array.isArray(data) && key === propertyName) {
      return buildPath(currentPath, propertyName);
    }

    // Search deeper in nested objects
    if (isObject(value)) {
      const newPath = buildPath(currentPath, key);
      const result = searchForProperty(value, propertyName, newPath);
      if (result) return result;
    }
  }

  return null;
};

// Helper function to build path based on key type
export const buildPath = (currentPath: string, key: string | number): string => {
  if (currentPath) {
    const keyPart = typeof key === 'number' ? `[${key}]` : `.${key}`;
    return `${currentPath}${keyPart}`;
  }
  return typeof key === 'number' ? `[${key}]` : String(key);
};
