import OutputElementBox from "components/OutputElementBox";
import { FC } from "react";
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
};

// todo remove
const testObj = {
  test: {
    test2: {
      test3: "test",
    },
  },
  test2: [
    {
      test3: "test",
      nestedArr: [1, 2, 3],
    },
  ],
  test3: [
    {
      test4: "test",
    },
  ],
  float: 1.23,
  int: 1,
  bool: true,
  string: "test",
  null: null,
  undefined: undefined,
  arr: [1, 2, 3],
  1: "string value",
};

export const ObjectTree: FC<ObjectTreeProps> = ({ path, data }) => {
  const pathArray = typeof path === "string" ? path.split(".") : [path];
  const root = pathArray.pop()!;

  return (
    <div style={{ padding: "0px 15px 5px" }}>
      <JSONTree
        // todo obj
        // data={testObj}
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
      />
    </div>
  );
};
