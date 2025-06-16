import React, { FC, useCallback, useRef } from "react";
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
import CustomNode from "../Steps/CustomNode";
import PlaceholderNode from "../Steps/PlaceholderNode";
import { StepType } from "../../types";
import { useTranslation } from "react-i18next";
import useServiceStore from "store/new-services.store";
import { onDrop, onFlowNodeDragStop, onNodeDrag } from "services/flow-builder";
import { GRID_UNIT } from "types/service-flow";

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
  const { t } = useTranslation();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const startDragNode = useRef<Node | undefined>(undefined);

  const reactFlowInstance = useServiceStore(state => state.reactFlowInstance);
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };
  
  const fitViewOptions = {
    padding: 3,
  };

  const defaultNodes: Node[] = [
    {
      id: "1",
      type: "start",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        type: "start",
      },
      className: "start",
      selectable: false,
      draggable: false,
    },
    {
      id: "2",
      data: { label: "+" },
      position: { x: 0, y: 150 },
      type: "placeholder",
    },
  ];

  // initial setup: connect the workflow node to the placeholder node with a placeholder edge
  const defaultEdges: Edge[] = [
    {
      id: "1=>2",
      source: "1",
      target: "2",
      type: "placeholder",
    },
  ];

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
      // onInit={setReactFlowInstance}
      // we are setting deleteKeyCode to null to prevent the deletion of nodes in order to keep the example simple.
      // If you want to enable deletion of nodes, you need to make sure that you only have one root node in your graph.
      deleteKeyCode={null}
    >
      <MiniMap />
      <Background color="#D2D3D8" gap={16} lineWidth={9} />
      <Controls orientation="horizontal" showInteractive={false} />
    </ReactFlow>
    // {/* <ReactFlow
    //   nodes={nodes}
    //   edges={edges}
    //   onNodesChange={useServiceStore.getState().onNodesChange}
    //   onEdgesChange={useServiceStore.getState().onEdgesChange}
    //   snapToGrid
    //   snapGrid={[GRID_UNIT, GRID_UNIT]}
    //   defaultViewport={{ x: 38 * GRID_UNIT, y: 3 * GRID_UNIT, zoom: 0 }}
    //   panOnScroll
    //   nodeTypes={nodeTypes}
    //   onInit={setReactFlowInstance}
    //   onDragOver={onDragOver}
    //   onDrop={(event) => onDrop(event, reactFlowWrapper, setDefaultMessages)}
    //   onNodeDrag={onNodeDrag}
    //   onNodeDragStop={onNodeDragStop}
    //   onNodeDragStart={onNodeDragStart}
    //   onNodeMouseEnter={onNodeMouseEnter}
    //   onNodeMouseLeave={onNodeMouseLeave}
    // >
    //   <Controls />
    //   <MiniMap />
    //   <Background color="#D2D3D8" gap={16} lineWidth={2} />
    // </ReactFlow> */}
  );
};

export default FlowBuilder;
