import OutputElementBox from "components/OutputElementBox";
import { CSSProperties, FC, useState } from "react";
import { JSONTree, KeyPath } from "react-json-tree";
import "./styles.scss";
import { stringToTemplate } from "utils/string-util";

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

// todo remove
// const fakeData = {
//   a: 1.123456789,
//   b: 2.123456789,
//   c: 3.123456789,
//   d: 4.123456789,
//   e: 5.123456789,
//   f: {
//     a: 1.123456789,
//     b: 2.123456789,
//     c: 3.123456789,
//     d: 4.123456789,
//     e: 5.123456789,
//   },
//   bool: true,
//   null: null,
//   undefined: undefined,
//   array: [1, 2, 3, 4, 5],
//   object: {
//     a: 1,
//   },
// };

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data, style }) => {
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;
  const [roundedValues, setRoundedValues] = useState<Map<string, number>>(new Map());
  // todo maybe test escaping

  console.log("igor roundedValues", Object.fromEntries(roundedValues));

  const buildKeyPathString = (keyPath: KeyPath) => {
    const base = pathArray.join(".") + "." + getKeyPathString(keyPath);
    const isRounded = roundedValues.has(getKeyPathString(keyPath));
    if (!isRounded) return stringToTemplate(base);

    return stringToTemplate("Math.round((" + base + " + Number.EPSILON) * 100) / 100)");
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
                  // todo extract
                  const target = e.target as HTMLInputElement;
                  const keyPathString = getKeyPathString(keyPath);
                  setRoundedValues((prev) => {
                    const newMap = new Map(prev);
                    if (target.checked) {
                      newMap.set(keyPathString, round(raw));
                    } else {
                      newMap.delete(keyPathString);
                    }
                    return newMap;
                  });
                }}
              />
              <span style={{ color: "black", fontStyle: "italic" }}>Round </span>
              <span>{roundedValues.has(getKeyPathString(keyPath)) ? round(raw) : raw}</span>
            </>
          ) : (
            <span>{String(raw)}</span>
          );
        }}
      />
    </div>
  );
};
