import { Handle, NodeProps, Position, useStore, useUpdateNodeInternals } from '@xyflow/react';
import './Node.scss';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Track from 'components/Track';
import React, { FC, useEffect, useMemo } from 'react';
import { MdDeleteOutline, MdOutlineEdit, MdOutlineRemoveRedEye } from 'react-icons/md';
import useServiceStore from 'store/services.store';
import { StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';
import { MCQ_SOURCE_HANDLE_ID, mcqHasEmptyBranches } from 'utils/mcq-flow-utils';

import StepNode from './StepNode';

type CustomNodeProps = {
  data: NodeDataProps;
};

const CustomNode: FC<NodeProps & CustomNodeProps> = (props) => {
  const { data, isConnectable, id } = props;
  const orientation = useServiceStore((state) => state.orientation);
  const isMcq = data.stepType === StepType.MultiChoiceQuestion;
  const shouldOffsetHandles = !isMcq && data.childrenCount > 1;

  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);

  const mcqCanConnect = useMemo(() => !isMcq || mcqHasEmptyBranches(id, nodes, edges), [edges, id, isMcq, nodes]);

  const canConnect = isConnectable && mcqCanConnect;

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.childrenCount, id, isMcq, mcqCanConnect, updateNodeInternals, orientation]);

  const isFinishingStep = () => {
    return data.type === 'finishing-step';
  };

  const getTargetPosition = () => {
    return orientation === 'horizontal' ? Position.Left : Position.Top;
  };

  const getSourcePosition = () => {
    return orientation === 'horizontal' ? Position.Right : Position.Bottom;
  };

  const bottomHandles = (): React.JSX.Element => {
    if (isMcq) {
      return (
        <Handle
          id={MCQ_SOURCE_HANDLE_ID}
          type="source"
          position={getSourcePosition()}
          isConnectable={canConnect}
          hidden={isFinishingStep()}
        />
      );
    }

    return (
      <>
        {new Array(data.childrenCount).fill(0).map((_, i) => (
          <Handle
            key={`handle-${id}-${i}`}
            id={`handle-${id}-${i}`}
            type="source"
            position={getSourcePosition()}
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
      <Handle type="target" position={getTargetPosition()} isConnectable={isConnectable} />
      <StepNode data={data} />
      {data.stepType !== 'rule' && (
        <Track style={{ position: 'fixed', top: 8, right: 8 }}>
          <Button
            appearance="text"
            onClick={() => {
              data.setClickedNode(id);
              data.onEdit(id);
              // Workaround for a bug that prevents @radix-ui/react-dialog and jsoneditor working together
              // https://github.com/radix-ui/primitives/issues/2122
              // Second part of the fix is in Popup.tsx
              setTimeout(() => (document.body.style.pointerEvents = ''), 0);
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
