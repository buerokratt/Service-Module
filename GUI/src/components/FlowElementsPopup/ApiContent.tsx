import { FC } from "react";
import Track from "../Track";
import PreviousVariables from "./PreviousVariables";
import { EndpointData } from "types/endpoint";
import ApiEndpointCard from "components/ApiEndpointCard";

type ApiContentProps = {
  readonly nodeId: string;
  readonly endpoint: EndpointData | undefined;
};

const ApiContent: FC<ApiContentProps> = ({ nodeId, endpoint }) => {
  return (
    <Track direction="vertical" align="stretch">
      {endpoint && (
        <ApiEndpointCard
          endpoint={endpoint}
          isDeletable={false}
          showCommonSwitch={false}
          onNameChange={(name) => {
            endpoint.name = name;
          }}
        />
      )}
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default ApiContent;
