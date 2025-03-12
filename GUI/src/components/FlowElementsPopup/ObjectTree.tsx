import OutputElementBox from "components/OutputElementBox";
import { CSSProperties, FC, useState } from "react";
import { JSONTree, KeyPath } from "react-json-tree";
import "./styles.scss";
import { stringToTemplate } from "utils/string-util";
import { useTranslation } from "react-i18next";

// Theme colors are inverted with invertTheme below
const theme = {
  base00: "#2b2c34", // black-coral-16 (background)
  base01: "#3c3e48", // black-coral-14 (slightly lighter background)
  base02: "#4d4f5d", // black-coral-12 (selection background)
  base03: "#6b6e7d", // black-coral-9 (comments, invisibles)
  base04: "#898b97", // black-coral-7 (dark foreground)
  base05: "#d2d3d8", // black-coral-2 (default foreground)
  base06: "#e1e2e5", // black-coral-1 (light foreground)
  base07: "#f0f0f2", // black-coral-0 (light background)
  base08: "#d73e3e", // jasper-10 (red - variables, XML tags)
  base09: "#ff8000", // orange-10 (orange - integers, boolean)
  base0A: "#ffb511", // dark-tangerine-10 (yellow - classes, CSS rules)
  base0B: "#308653", // sea-green-10 (green - strings, attr names)
  base0C: "#73a5cc", // sapphire-blue-5 (teal - operators, regex)
  base0D: "#f9f9f9", // extra-light (blue - functions, methods)
  base0E: "#e99595", // jasper-5 (purple - keywords)
  base0F: "#e87500", // orange-11 (dark orange - deprecated)
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
  const { t } = useTranslation();
  const [roundedValues, setRoundedValues] = useState<Map<string, number>>(new Map());

  const buildKeyPathString = (keyPath: KeyPath) => {
    const key = getKeyPathString(keyPath);

    const base = pathArray.join(".") + "." + key;
    const isRounded = roundedValues.has(key);
    if (!isRounded) return stringToTemplate(base);

    return stringToTemplate("Math.round((" + base + " + Number.EPSILON) * 100) / 100)");
  };

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
              <label htmlFor={key}>{t("serviceFlow.popup.round")}</label>
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
