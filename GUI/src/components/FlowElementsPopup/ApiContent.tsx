import ApiEndpointCard from 'components/ApiEndpointCard';
import { FC, useEffect, useMemo } from 'react';
import { EndpointData } from 'types/endpoint';

import Track from '../Track';
import PreviousVariables from './PreviousVariables';
import { Node } from '@xyflow/react';
import { NodeDataProps } from 'types/service-flow';

type ApiContentProps = {
  readonly node: Node<NodeDataProps>;
  readonly endpoint: EndpointData | undefined;
  readonly onEndpointChange?: (endpoint: EndpointData) => void;
};

const ApiContent: FC<ApiContentProps> = ({ node, endpoint, onEndpointChange }) => {
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
      <PreviousVariables node={node} />
    </Track>
  );
};

export default ApiContent;
