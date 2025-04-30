import { CSSProperties, FC, useState, useCallback } from "react";
import { JSONTree, KeyPath } from "react-json-tree";
import { ObjectTreeLabel } from "./ObjectTreeLabel";
import { ObjectTreeValue } from "./ObjectTreeValue";

// Some theme colors are inverted with invertTheme below to get the light theme
const theme = {
  base00: "#2b2c34", // black-coral-16 (background)
  base01: "#3c3e48", // black-coral-14 (slightly lighter background)
  base02: "#4d4f5d", // black-coral-12 (selection background)
  base03: "#6b6e7d", // black-coral-9 (comments, invisibles)
  base04: "#898b97", // black-coral-7 (dark foreground)
  base05: "#d2d3d8", // black-coral-2 (default foreground)
  base06: "#e1e2e5", // black-coral-1 (light foreground)
  base07: "#f0f0f2", // black-coral-0 (light background)
  base08: "#FF6F61", // jasper-10 (red - variables, XML tags)
  base09: "#6BDB75", // orange-10 (orange - integers, boolean)
  base0A: "#FFC145", // dark-tangerine-10 (yellow - classes, CSS rules)
  base0B: "#FF6F61", // sea-green-10 (green - strings, attr names)
  base0C: "#A1A1A1", // sapphire-blue-5 (teal - operators, regex)
  base0D: "#f9f9f9", // extra-light (blue - functions, methods)
  base0E: "#d73e3e", // jasper-5 (purple - keywords)
  base0F: "#e87500", // orange-11 (dark orange - deprecated)
};

type ObjectTreeProps = {
  data: object;
  path: string | number;
  style?: CSSProperties;
};

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data, style }) => {
  // Consider using global state if this component gets more complex
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;
  const [roundedValues, setRoundedValues] = useState<Map<string, number>>(new Map());

  // Memoize the component functions to prevent them from being recreated on each render
  // https://stackoverflow.com/a/72589674/7405507
  const labelRenderer = useCallback(
    (keyPath: KeyPath, nodeType: string) => (
      <ObjectTreeLabel
        keyPath={keyPath}
        nodeType={nodeType}
        pathArray={[...pathArray, root]}
        roundedValues={roundedValues}
      />
    ),
    [pathArray, root, roundedValues]
  );
  const valueRenderer = useCallback(
    (rawValue: unknown, _: unknown, ...keyPath: KeyPath) => (
      <ObjectTreeValue
        keyPath={keyPath}
        rawValue={rawValue}
        roundedValues={roundedValues}
        setRoundedValues={setRoundedValues}
      />
    ),
    [roundedValues, setRoundedValues]
  );

  return (
    <div style={{ padding: "0px 15px 5px", ...style }}>
      <JSONTree
        data={data}
        theme={theme}
        invertTheme={true}
        keyPath={[String(root)]}
        labelRenderer={labelRenderer}
        valueRenderer={valueRenderer}
      />
    </div>
  );
};
