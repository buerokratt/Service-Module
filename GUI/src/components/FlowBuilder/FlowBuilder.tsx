import React, { FC, useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../Steps/CustomNode";
import PlaceholderNode from "../Steps/PlaceholderNode";
import { StepType } from "../../types";
import StartNode from "../Steps/StartNode";
import { useTranslation } from "react-i18next";
import useServiceStore from "store/new-services.store";
import { onDrop, onFlowNodeDragStop, onNodeDrag } from "services/flow-builder";
import { GRID_UNIT } from "types/service-flow";

const nodeTypes = {
  startNode: StartNode,
  customNode: CustomNode,
  placeholder: PlaceholderNode,
};

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
  const { t } = useTranslation();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const startDragNode = useRef<Node | undefined>(undefined);

  const reactFlowInstance = useServiceStore(state => state.reactFlowInstance);
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const onNodeDragStart = useCallback(
    (_: any, draggedNode: Node) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      startDragNode.current = draggedNode;
      // setStartDragNode((draggedNode) => [...startDragNode, ...draggedNode]);
    },
    [reactFlowInstance, edges]
  );

  const onNodeDragStop = useCallback((event: any, draggedNode: Node) => 
    onFlowNodeDragStop(event, draggedNode, reactFlowWrapper, startDragNode),
  []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const setDefaultMessages = (stepType: StepType) => {
    switch (stepType) {
      case StepType.FinishingStepEnd:
        return t("serviceFlow.popup.serviceEnded");
      case StepType.FinishingStepRedirect:
        return t("serviceFlow.popup.redirectToCustomerSupport");
    }
  };

  return (
    <div className={description.length > 0 ? "graph__bodyWithDescription" : "graph__body"} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={useServiceStore.getState().onNodesChange}
        onEdgesChange={useServiceStore.getState().onEdgesChange}
        snapToGrid
        snapGrid={[GRID_UNIT, GRID_UNIT]}
        defaultViewport={{ x: 38 * GRID_UNIT, y: 3 * GRID_UNIT, zoom: 0 }}
        panOnScroll
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={(event) => onDrop(event, reactFlowWrapper, setDefaultMessages)}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeDragStart={onNodeDragStart}
        onNodeMouseEnter={(_, node) => {
          setNodes((prevNodes) =>
            prevNodes.map((prevNode) => {
              if (prevNode.type === "customNode" && prevNode.data === node.data) {
                prevNode.selected = true;
                prevNode.className = "selected";
              }
              return prevNode;
            })
          );
        }}
        onNodeMouseLeave={(_, node) => {
          setNodes((prevNodes) =>
            prevNodes.map((prevNode) => {
              if (prevNode.type === "customNode" && prevNode.data === node.data) {
                prevNode.selected = false;
                prevNode.className = prevNode.data.type;
              }
              return prevNode;
            })
          );
        }}
      >
        <Controls />
        <MiniMap />
        <Background color="#D2D3D8" gap={16} lineWidth={2} />
      </ReactFlow>
    </div>
  );
};

export default FlowBuilder;
