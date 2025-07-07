import React, { FC, useCallback } from "react";
import { ReactFlow, Background, Controls, Edge, MiniMap, Node, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useServiceStore from "store/new-services.store";
import edgeTypes from "components/Flow/EdgeTypes";
import nodeTypes from "components/Flow/NodeTypes";
import useLayout from "hooks/flow/useLayout";
import { useOnNodesDelete } from "hooks/flow/useOnNodeDelete";

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  nodes,
  edges,
}) => {
  useLayout();
  const { getNodes, setEdges } = useReactFlow();
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const onConnect = useCallback(({ source, target }: any) => {
    const nodes = getNodes();
    const [from, to] = [source, target].sort(
      (a, b) => nodes.findIndex((n) => n.id === a) - nodes.findIndex((n) => n.id === b)
    );

    setEdges((eds) => [
      ...eds,
      {
        id: `${from}->${to}`,
        source: from,
        target: to,
        type: "step",
      },
    ]);
  }, []);

  const isValidConnection = useCallback((connection: any) => {
    return connection.source !== connection.target;
  }, []);

  const onNodesDelete = useOnNodesDelete();
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={useServiceStore.getState().onNodesChange}
      onEdgesChange={useServiceStore.getState().onEdgesChange}
      snapToGrid
      proOptions={{ hideAttribution: true }}
      panOnScroll
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setReactFlowInstance}
      nodesDraggable={false}
      onConnect={onConnect}
      onNodesDelete={onNodesDelete}
      fitView
      fitViewOptions={{ padding: 5 }}
      isValidConnection={isValidConnection}
      defaultEdgeOptions={{ type: "step", deletable: false }}
    >
      <MiniMap />
      <Background color="#D2D3D8" gap={16} lineWidth={9} />
      <Controls orientation="horizontal" showInteractive={false} />
    </ReactFlow>
  );
};

export default FlowBuilder;
