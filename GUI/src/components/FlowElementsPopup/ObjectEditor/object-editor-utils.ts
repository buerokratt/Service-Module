import { searchForProperty, searchForValue } from 'utils/object-util';

// Helper function to find the path to a node in the JSON structure
export const findNodePath = (node: Element, data: Record<string, unknown>): string | null => {
  // Try to find by text content (for values)
  const textContent = node.textContent?.trim();
  if (textContent) {
    const path = searchForValue(data, textContent);
    return path;
  }

  // If no text content (empty value), try to find by the associated property name
  // Look for the property name in the same table row
  const tableRow = node.closest('tr');
  if (tableRow) {
    const fieldElement = tableRow.querySelector('.jsoneditor-field');
    if (fieldElement) {
      const propertyName = fieldElement.textContent?.trim();
      if (propertyName) {
        // Search for the property name in the data structure
        const path = searchForProperty(data, propertyName);
        return path;
      }
    }
  }

  return null;
};
