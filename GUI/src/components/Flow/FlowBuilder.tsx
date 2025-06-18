import React, { FC } from "react";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ProOptions,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useServiceStore from "store/new-services.store";

import useLayout from "../../hooks/flow/useLayout";
import nodeTypes from "./NodeTypes";
import edgeTypes from "./EdgeTypes";

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  description: string;
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  nodes,
  setNodes,
  edges,
  description,
}) => {
  useLayout();
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };
  
  const fitViewOptions = {
    padding: 3,
  };

  return (
    <ReactFlow
      defaultNodes={nodes}
      defaultEdges={edges}
      proOptions={proOptions}
      fitView
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitViewOptions={fitViewOptions}
      minZoom={0.2}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnDoubleClick={true}
      onInit={setReactFlowInstance}
      deleteKeyCode={null}
    >
      <MiniMap />
      <Background color="#D2D3D8" gap={16} lineWidth={9} />
      <Controls orientation="horizontal" showInteractive={false} />
    </ReactFlow>
  );
};

export default FlowBuilder;
