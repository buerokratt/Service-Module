import { Step } from "types";
import { Node } from "@xyflow/react";

export const getNodeLabel = (step: Step, nodes: Node[]) => {
  const baseLabel = step.label.split(" - ").pop();
  const existingNumbers = nodes
    .filter((node: any) => node.data.stepType === step.type)
    .map((node: any) => node.data.label)
    .filter((label) => label.startsWith(baseLabel))
    .map((label) => {
      const parts = label.split(" - ");
      if (parts.length > 1) {
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .sort((a, b) => a - b);

  let nextNumber = 1;
  for (const num of existingNumbers) {
    if (num === nextNumber) {
      nextNumber++;
    } else if (num > nextNumber) {
      break;
    }
  }

  return `${baseLabel} - ${nextNumber}`;
}
