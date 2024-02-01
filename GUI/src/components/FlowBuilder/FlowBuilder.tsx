import React, { FC, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  useUpdateNodeInternals,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../Steps/CustomNode";
import PlaceholderNode from "../Steps/PlaceholderNode";
import { ConditionRuleType, StepType } from "../../types";
import StartNode from "../Steps/StartNode";
import { useTranslation } from "react-i18next";
import useServiceStore from "store/new-services.store";
import { UpdateFlowInputRules, onDrop, onFlowNodeDragStop, onNodeDrag, updateFlowInputRules } from "services/flow-builder";
import { GRID_UNIT } from "types/service-flow";

const nodeTypes = {
  startNode: StartNode,
  customNode: CustomNode,
  placeholder: PlaceholderNode,
};

type FlowBuilderProps = {
  updatedRules: { rules: (string | null)[]; rulesData: ConditionRuleType[] };
  nodes: Node[];
  edges: Edge[];
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  description: string;
};

const FlowBuilder: FC<FlowBuilderProps> = ({
  updatedRules,
  nodes,
  setNodes,
  edges,
  setEdges,
  description,
}) => {
  const { t } = useTranslation();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const setClickedNode = useServiceStore(state => state.setClickedNode);
  const startDragNode = useRef<Node | undefined>(undefined);
  const updateNodeInternals = useUpdateNodeInternals();

  const reactFlowInstance = useServiceStore(state => state.reactFlowInstance);
  const setReactFlowInstance = useServiceStore(state => state.setReactFlowInstance);
  const onDelete = useServiceStore(state => state.onDelete);
  const handleNodeEdit = useServiceStore.getState().handleNodeEdit;

  const updateInputRules = useCallback((rules: UpdateFlowInputRules) => 
    updateFlowInputRules(rules, updateNodeInternals),
  []);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type !== "customNode") return node;
        node.data = {
          ...node.data,
          onDelete,
          onEdit: handleNodeEdit,
          setClickedNode,
          update: updateInputRules,
        };
        return node;
      })
    );
  }, [reactFlowInstance]);

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

  useEffect(() => {
    if (updatedRules.rules.length === 0) return;
    updateInputRules(updatedRules);
  }, [updatedRules]);

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
        onDrop={(event) => onDrop(event, reactFlowWrapper, setDefaultMessages, updateInputRules)}
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
