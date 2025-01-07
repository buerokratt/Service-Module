import { FC } from "react";
import Track from "../Track";
import useServiceStore from "store/new-services.store";
import PreviousVariables from "./PreviousVariables";
import AssignBuilder from "./AssignBuilder";

type AssignContentProps = {
  readonly nodeId: string;
};

const AssignContent: FC<AssignContentProps> = ({ nodeId }) => {
  const assignElements = useServiceStore((state) => state.assignElements);

  return (
    <Track direction="vertical" align="stretch">
      <AssignBuilder onChange={useServiceStore.getState().changeAssignNode} seedGroup={assignElements} />
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default AssignContent;
