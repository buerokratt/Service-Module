import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

import useEdgeClick from '../../../hooks/flow/useEdgeClick';

export default function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  // see the hook for implementation details
  // onClick adds a node in between the nodes that are connected by this edge
  const onClick = useEdgeClick(id);

  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} style={style} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <button
          style={{
            transform: `translate(${edgeCenterX}px, ${edgeCenterY}px) translate(-50%, -50%)`,
            backgroundColor: 'white',
          }}
          onClick={onClick}
          className="edge-button nodrag nopan"
        >
          +
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
