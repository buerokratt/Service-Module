import OutputElementBox from "components/OutputElementBox";
import { FC } from "react";
import { JSONTree } from "react-json-tree";

type VariableContentProps = {
  value: object;
  name: string | number;
};

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

const testObj = {
  test: {
    test2: {
      test3: "test",
    },
  },
  test2: [
    {
      test3: "test",
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
};

// todo name
export const VariableContent: FC<VariableContentProps> = ({ name, value }) => {
  // console.log("igor path", typeof name === "string" ? name.split(".") : [name]);
  return (
    <JSONTree
      data={testObj}
      // data={value}
      theme={theme}
      invertTheme={true}
      // keyPath={typeof name === "string" ? name.split(".") : [name]}
      keyPath={typeof name === "string" ? [name.split(".").pop()] : [name]}
      labelRenderer={([key, keyPath]) => {
        // console.log(key);
        console.log(keyPath);
        return (
          // todo parse number strings? Number.isInteger() for int/float
          // todo key needs to have prefix when dragged
          // todo bad if array - test also nested in obj
          <>
            <OutputElementBox
              text={String(key)}
              // value={`\${${name}.${key}}`}
              value={`\${${name}.${keyPath}.${key}}`}
              useValue
              draggable={true}
            ></OutputElementBox>
            {/* <span>:</span> */}
          </>
        );
      }}
    />
  );
  //   return <>{JSON.stringify(value)}</>;
};
