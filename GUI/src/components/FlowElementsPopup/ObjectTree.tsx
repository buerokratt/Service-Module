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

type ObjectTreeProps = {
  data: object;
  path: string | number;
  style?: CSSProperties;
};

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data, style }) => {
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;
  const [roundedValues, setRoundedValues] = useState<Record<string, number>>({});
  // todo maybe test escaping

  console.log("igor round", roundedValues);

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
            value={stringToTemplate(pathArray.join(".") + "." + getKeyPathString(keyPath))}
            useValue
            draggable={true}
            className="object-tree-chip"
          />
        )}
        valueRenderer={(raw, _, ...keyPath) => {
          // console.log("igor render", _, keyPath);
          return typeof raw === "number" && !Number.isInteger(raw) ? (
            <>
              {/* todo style */}
              {/* <FormCheckbox
                checked={true}
                item={{ value: "round", label: "round" }}
                onChange={() => null}
                // style={{ color: "black", fontStyle: "italic" }}
              ></FormCheckbox> */}
              <input
                type="checkbox"
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  const keyPathString = getKeyPathString(keyPath);
                  setRoundedValues((prev) =>
                    target.checked
                      ? { ...prev, [keyPathString]: Math.round((raw + Number.EPSILON) * 100) / 100 }
                      : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== keyPathString))
                  );
                }}
              />
              <span style={{ color: "black", fontStyle: "italic" }}>Round </span>
              <span>{String(raw)}</span>
            </>
          ) : (
            <span>{String(raw)}</span>
          );
        }}
      />
    </div>
  );
};
