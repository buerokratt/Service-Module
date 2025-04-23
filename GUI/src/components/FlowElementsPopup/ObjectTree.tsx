import { CSSProperties, FC, useState } from "react";
import { JSONTree, KeyPath } from "react-json-tree";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { ObjectTreeLabel, getKeyPathString } from "./ObjectTreeLabel";

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

const round = (n: number) => {
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

type ObjectTreeProps = {
  data: object;
  path: string | number;
  style?: CSSProperties;
};

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data, style }) => {
  const { t } = useTranslation();
  // Consider using global state if this component gets more complex
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;
  const [roundedValues, setRoundedValues] = useState<Map<string, number>>(new Map());

  const toggleRounding = (keyPath: KeyPath, value: number, roundValue = true) => {
    const key = getKeyPathString(keyPath);

    setRoundedValues((prev) => {
      const newMap = new Map(prev);
      if (roundValue) {
        newMap.set(key, round(value));
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
  };

  return (
    <div style={{ padding: "0px 15px 5px", ...style }}>
      <JSONTree
        data={data}
        theme={theme}
        invertTheme={true}
        keyPath={[String(root)]}
        labelRenderer={(keyPath, nodeType) => (
          <ObjectTreeLabel
            keyPath={keyPath}
            nodeType={nodeType}
            pathArray={[...pathArray, root]}
            roundedValues={roundedValues}
          />
        )}
        valueRenderer={(raw, _, ...keyPath) => {
          const key = getKeyPathString(keyPath);

          return typeof raw === "number" && !Number.isInteger(raw) ? (
            <span className="object-tree-checkbox">
              <input
                id={key}
                type="checkbox"
                onClick={(e) => toggleRounding(keyPath, raw, (e.target as HTMLInputElement).checked)}
              />
              <label htmlFor={key}>{t("serviceFlow.popup.round")}</label>
              <span>{roundedValues.has(key) ? round(raw) : raw}</span>
            </span>
          ) : (
            <span>{String(raw)}</span>
          );
        }}
      />
    </div>
  );
};
