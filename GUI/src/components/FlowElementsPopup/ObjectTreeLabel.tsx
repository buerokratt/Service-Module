import { FC } from "react";
import { KeyPath } from "react-json-tree";
import OutputElementBox from "components/OutputElementBox";
import { getKeyPathString, getTypeColor } from "../../utils/object-util";
import { stringToTemplate } from "utils/string-util";

const escapeKey = (key: string) => {
  return key.replace(/"/g, '\\"');
};

const parseNodeType = (nodeType: string): number | string | unknown[] | undefined | {} => {
  switch (nodeType) {
    case "Number":
      return 0;
    case "String":
      return "";
    case "Array":
      return [];
    case "Object":
      return {};
    default:
      return undefined;
  }
};

interface ObjectTreeLabelProps {
  keyPath: KeyPath;
  nodeType: string;
  pathArray: string[];
  roundedValues: Map<string, number>;
}

export const ObjectTreeLabel: FC<ObjectTreeLabelProps> = ({ keyPath, nodeType, pathArray, roundedValues }) => {
  const buildKeyPathString = (keyPath: KeyPath) => {
    const key = getKeyPathString(keyPath);
    const [root, ...remainingPath] = [...pathArray].reverse();

    let base = "";
    if (remainingPath.length > 0) {
      // Start with the root object name
      base = remainingPath.reverse()[0];

      // Add remaining path elements with bracket notation
      for (let i = 1; i < pathArray.length - 1; i++) {
        base += `["${escapeKey(pathArray[i])}"]`;
      }

      // Add the final key parts
      const keyParts = key.split('"]["');
      for (const part of keyParts) {
        base += `["${escapeKey(part)}"]`;
      }
    } else {
      // If there's no path array, just use the root and key
      base = `${root}`;

      // Add the key parts
      const keyParts = key.split('"]["');
      for (const part of keyParts) {
        base += `["${escapeKey(part)}"]`;
      }
    }

    // todo extract this to a function
    return stringToTemplate(roundedValues.has(key) ? "Math.round((" + base + " + Number.EPSILON) * 100) / 100" : base);
  };

  const key = String(keyPath[0]);
  const typeColor = getTypeColor(parseNodeType(nodeType));

  return (
    <OutputElementBox
      text={`${key}:`}
      value={buildKeyPathString(keyPath)}
      useValue
      dragData={{ key, value: buildKeyPathString(keyPath), data: parseNodeType(nodeType), id: "" }}
      className="object-tree-chip"
      borderColor={typeColor.color}
    />
  );
};
