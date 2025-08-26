import { FC } from 'react';
import { KeyPath } from 'react-json-tree';
import OutputElementBox from 'components/OutputElementBox';
import { getKeyPathString, getTypeColor } from '../../utils/object-util';
import { stringToTemplate } from 'utils/string-util';

const escapeKey = (key: string) => {
  return key.replace(/"/g, '\\"');
};

const parseNodeType = (nodeType: string): number | string | unknown[] | undefined | {} => {
  switch (nodeType) {
    case 'Number':
      return 0;
    case 'String':
      return '';
    case 'Array':
      return [];
    case 'Object':
      return {};
    default:
      return undefined;
  }
};

const buildKeyPathString = (key: string, pathArray: string[]) => {
  const [root, ...remainingPath] = [...pathArray].reverse();

  let path = '';
  if (remainingPath.length > 0) {
    // Start with the root object name
    path = remainingPath.toReversed()[0];

    // Add remaining path elements with bracket notation
    for (let i = 1; i < pathArray.length - 1; i++) {
      path += `["${escapeKey(pathArray[i])}"]`;
    }

    // Add the final key parts
    const keyParts = key.split('"]["');
    for (const part of keyParts) {
      path += `["${escapeKey(part)}"]`;
    }
  } else {
    // If there's no path array, just use the root and key
    path = `${root}`;

    // Add the key parts
    const keyParts = key.split('"]["');
    for (const part of keyParts) {
      path += `["${escapeKey(part)}"]`;
    }
  }

  return path;
};

const buildRoundedValueString = (base: string) => {
  return 'Math.round((' + base + ' + Number.EPSILON) * 100) / 100';
};

interface ObjectTreeLabelProps {
  keyPath: KeyPath;
  nodeType: string;
  pathArray: string[];
  roundedValues: Map<string, number>;
}

export const ObjectTreeLabel: FC<ObjectTreeLabelProps> = ({ keyPath, nodeType, pathArray, roundedValues }) => {
  const key = String(keyPath[0]);
  const typeColor = getTypeColor(parseNodeType(nodeType));

  const buildValueString = (keyPath: KeyPath) => {
    const base = buildKeyPathString(getKeyPathString(keyPath), pathArray);
    return stringToTemplate(roundedValues.has(key) ? buildRoundedValueString(base) : base);
  };

  return (
    <OutputElementBox
      dragData={{ key, value: buildValueString(keyPath), data: parseNodeType(nodeType), id: '' }}
      className="object-tree-chip"
      borderColor={typeColor.color}
    >
      {key}:
    </OutputElementBox>
  );
};
