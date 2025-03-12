import OutputElementBox from "components/OutputElementBox";
import { CSSProperties, FC, useState } from "react";
import { JSONTree, KeyPath } from "react-json-tree";
import "./styles.scss";
import { stringToTemplate } from "utils/string-util";
import { FormCheckbox } from "components/FormElements";

const theme = {
  base00: "black",
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "#fd971f",
  base0A: "#f4bf75",
  base0B: "#a6e22e",
  base0C: "#a1efe4",
  base0D: "#66d9ef",
  base0E: "#ae81ff",
  base0F: "#cc6633",
};

const getKeyPathString = (keyPath: KeyPath) => {
  return keyPath.toReversed().join(".");
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
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;
  const [roundedValues, setRoundedValues] = useState<Map<string, number>>(new Map());

  const buildKeyPathString = (keyPath: KeyPath) => {
    const base = pathArray.join(".") + "." + getKeyPathString(keyPath);
    const isRounded = roundedValues.has(getKeyPathString(keyPath));
    if (!isRounded) return stringToTemplate(base);

    return stringToTemplate("Math.round((" + base + " + Number.EPSILON) * 100) / 100)");
  };

  const toggleRounding = (keyPath: KeyPath, value: number, roundValue = true) => {
    const keyPathString = getKeyPathString(keyPath);

    setRoundedValues((prev) => {
      const newMap = new Map(prev);
      if (roundValue) {
        newMap.set(keyPathString, round(value));
      } else {
        newMap.delete(keyPathString);
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
        labelRenderer={(keyPath) => (
          <OutputElementBox
            text={String(keyPath[0]) + ":"}
            value={buildKeyPathString(keyPath)}
            useValue
            draggable={true}
            className="object-tree-chip"
          />
        )}
        valueRenderer={(raw, _, ...keyPath) => {
          const key = getKeyPathString(keyPath);
          return typeof raw === "number" && !Number.isInteger(raw) ? (
            <>
              <input
                id={key}
                type="checkbox"
                onClick={(e) => toggleRounding(keyPath, raw, (e.target as HTMLInputElement).checked)}
              />
              <label htmlFor={key}> Round </label>
              <span>{roundedValues.has(key) ? round(raw) : raw}</span>
            </>
          ) : (
            <span>{String(raw)}</span>
          );
        }}
      />
    </div>
  );
};
