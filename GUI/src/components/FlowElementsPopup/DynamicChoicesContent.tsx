import { FC } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import PreviousVariables from "./PreviousVariables";

type DynamicChoicesContentProps = {
  readonly nodeId: string;
};

const DynamicChoicesContent: FC<DynamicChoicesContentProps> = ({ nodeId }) => {
  const nodes = useServiceStore((state) => state.nodes);
  const currentNodeElements = nodes.findLast((node) => node.id === nodeId)?.data?.assignElements ?? [];

  return (
    <Track direction="vertical" align="stretch">
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default DynamicChoicesContent;
