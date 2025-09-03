import { Handle, NodeProps, Position, useUpdateNodeInternals } from '@xyflow/react';
import './Node.scss';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Track from 'components/Track';
import React, { FC, useEffect } from 'react';
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from 'react-icons/md';
import { NodeDataProps } from 'types/service-flow';

import StepNode from './StepNode';

type CustomNodeProps = {
  data: NodeDataProps;
};

const CustomNode: FC<NodeProps & CustomNodeProps> = (props) => {
  const { data, isConnectable, id } = props;
  const shouldOffsetHandles = data.childrenCount > 1;

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.childrenCount, id, updateNodeInternals]);

  const isFinishingStep = () => {
    return data.type === 'finishing-step';
  };

  const bottomHandles = (): React.JSX.Element => {
    return (
      <>
        {new Array(data.childrenCount).fill(0).map((_, i) => (
          <Handle
            key={`handle-${id}-${i}`}
            id={`handle-${id}-${i}`}
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={
              shouldOffsetHandles
                ? {
                    left: `${(100 / (data.childrenCount + 1)) * (i + 1)}%`,
                    visibility: isFinishingStep() ? 'hidden' : 'visible',
                  }
                : {}
            }
            hidden={isFinishingStep()}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <StepNode data={data} />
      {data.stepType !== 'rule' && (
        <Track style={{ position: 'fixed', top: 8, right: 8 }}>
          <Button
            appearance="text"
            onClick={() => {
              data.setClickedNode(id);
              data.onEdit(id);
            }}
          >
            <Icon icon={data.readonly ? <MdOutlineRemoveRedEye /> : <MdOutlineEdit />} size="medium" />
          </Button>
          <Button appearance="text" onClick={() => data.onDelete(id)}>
            <Icon icon={<MdDeleteOutline />} size="medium" />
          </Button>
        </Track>
      )}
      {bottomHandles()}
    </>
  );
};

export default CustomNode;
