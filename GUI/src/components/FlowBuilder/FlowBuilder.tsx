import React, { FC, useCallback, useRef } from "react";
import { ReactFlow, Background, Controls, Edge, MiniMap, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { StepType } from "../../types";
import { useTranslation } from "react-i18next";
import useServiceStore from "store/new-services.store";
import { onDrop, onFlowNodeDragStop, onNodeDrag } from "services/flow-builder";
import { GRID_UNIT } from "types/service-flow";
import edgeTypes from "components/Flow/EdgeTypes";
import nodeTypes from "components/Flow/NodeTypes";

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  nodes,
  setNodes,
  edges,
}) => {
  const { t } = useTranslation();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const startDragNode = useRef<Node | undefined>(undefined);

  const reactFlowInstance = useServiceStore(state => state.reactFlowInstance);
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);

  const onNodeDragStart = useCallback((event: any, draggedNode: Node) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      startDragNode.current = draggedNode;
    },
    [reactFlowInstance, edges]
  );

  const onNodeDragStop = useCallback((event: any, draggedNode: Node) => {
    onFlowNodeDragStop(event, draggedNode, reactFlowWrapper, startDragNode)
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const setDefaultMessages = useCallback((stepType: StepType) => {
    switch (stepType) {
      case StepType.FinishingStepEnd:
        return t("serviceFlow.popup.serviceEnded");
      case StepType.FinishingStepRedirect:
        return t("serviceFlow.popup.redirectToCustomerSupport");
    }
  }, [t]);

  const onNodeMouseEnter = (event: any, node: Node) => {
    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.type === "customNode" && prevNode.data === node.data) {
          prevNode.selected = true;
          prevNode.className = "selected";
        }
        return prevNode;
      })
    );
  }

  const onNodeMouseLeave = (event: any, node: Node) => {
    setNodes((prevNodes) =>
      prevNodes.map((prevNode) => {
        if (prevNode.type === "customNode" && prevNode.data === node.data) {
          prevNode.selected = false;
          prevNode.className = typeof prevNode.data.type === "string" ? prevNode.data.type : undefined;
        }
        return prevNode;
      })
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={useServiceStore.getState().onNodesChange}
      onEdgesChange={useServiceStore.getState().onEdgesChange}
      snapToGrid
      snapGrid={[GRID_UNIT, GRID_UNIT]}
      proOptions={{ hideAttribution: true }}
      defaultViewport={{ x: 38 * GRID_UNIT, y: 3 * GRID_UNIT, zoom: 0 }}
      panOnScroll
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setReactFlowInstance}
      // onDragOver={onDragOver}
      // onDrop={(event) => onDrop(event, reactFlowWrapper, setDefaultMessages)}
      // onNodeDrag={onNodeDrag}
      // onNodeDragStop={onNodeDragStop}
      // onNodeDragStart={onNodeDragStart}
      // onNodeMouseEnter={onNodeMouseEnter}
      // onNodeMouseLeave={onNodeMouseLeave}
    >
      <MiniMap />
      <Background color="#D2D3D8" gap={16} lineWidth={9} />
      <Controls orientation="horizontal" showInteractive={false} />
    </ReactFlow>
  );
};

export default FlowBuilder;
