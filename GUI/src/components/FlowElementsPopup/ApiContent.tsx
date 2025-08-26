import { FC, useEffect, useMemo } from 'react';
import Track from '../Track';
import PreviousVariables from './PreviousVariables';
import { EndpointData } from 'types/endpoint';
import ApiEndpointCard from 'components/ApiEndpointCard';

type ApiContentProps = {
  readonly nodeId: string;
  readonly endpoint: EndpointData | undefined;
  readonly onEndpointChange?: (endpoint: EndpointData) => void;
};

const ApiContent: FC<ApiContentProps> = ({ nodeId, endpoint, onEndpointChange }) => {
  const endpointCopy = useMemo(() => {
    return endpoint ? JSON.parse(JSON.stringify(endpoint)) : undefined;
  }, [endpoint]);

  useEffect(() => {
    if (onEndpointChange && endpointCopy) {
      onEndpointChange(endpointCopy);
    }
  }, [endpointCopy, onEndpointChange]);

  return (
    <Track direction="vertical" align="stretch">
      {endpointCopy && (
        <ApiEndpointCard
          endpoint={endpointCopy}
          isDeletable={false}
          showCommonSwitch={false}
          onNameChange={(name) => {
            endpointCopy.name = name;
          }}
        />
      )}
      <PreviousVariables nodeId={nodeId} />
    </Track>
  );
};

export default ApiContent;
