import OutputElementBox from "components/OutputElementBox";
import { CSSProperties, FC } from "react";
import { JSONTree } from "react-json-tree";
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

type ObjectTreeProps = {
  data: object;
  path: string | number;
  style?: CSSProperties;
};

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data, style }) => {
  const pathArray = String(path).split(".");
  const root = pathArray.pop()!;

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
            value={stringToTemplate(pathArray.join(".") + "." + keyPath.toReversed().join("."))}
            useValue
            draggable={true}
            className="object-tree-chip"
          />
        )}
        valueRenderer={(raw) => {
          return typeof raw === "number" ? ( // todo Number.isInteger()
            <>
              <input type="checkbox" />
              <span style={{ color: "black" }}>Round </span>
              <span>{String(raw)}</span>
            </>
          ) : (
            <strong>{String(raw)}</strong>
          );
        }}
      />
    </div>
  );
};
