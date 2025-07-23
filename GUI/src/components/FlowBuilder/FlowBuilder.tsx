import React, { FC, useCallback } from "react";
import { ReactFlow, Background, Controls, Edge, MiniMap, Node, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useServiceStore from "store/new-services.store";
import edgeTypes from "components/Flow/EdgeTypes";
import nodeTypes from "components/Flow/NodeTypes";
import useLayout from "hooks/flow/useLayout";
import { useOnNodesDelete } from "hooks/flow/useOnNodeDelete";
import { Button, Modal, Track } from "components";
import { useTranslation } from "react-i18next";
import { StepType } from "types";

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
};

const FlowBuilder: FC<FlowBuilderProps> = ({ nodes, edges }) => {
  useLayout();
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const setReactFlowInstance = useServiceStore((state) => state.setReactFlowInstance);
  const { t } = useTranslation();
  const { onNodesDelete, onEdgesDelete, isDeleteConnectionsModalVisible, setIsDeleteConnectionsModalVisible, onDeleteConfirmed, onKeepItConfirmed, hasConnectedNodes, setDeletedNodes } =
    useOnNodesDelete();
    const { setHasUnsavedChanges } = useServiceStore();

  const onConnect = useCallback(({ source, target }: any) => {
    const nodes = getNodes();
    const edges = getEdges();

    const parentOutgoingEdges = edges.filter((edge) => edge.source === source);

    const ghostEdges = parentOutgoingEdges.filter((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      return targetNode?.type === "ghost";
    });

    if (ghostEdges.length > 0) {
      const ghostNodeIds = ghostEdges.map((edge) => edge.target);
      const updatedEdges = edges.filter((edge) => !ghostEdges.includes(edge));
      const updatedNodes = nodes.filter((node) => !ghostNodeIds.includes(node.id));
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }

    setEdges((eds) => [
      ...eds,
      {
        id: `${source}->${target}`,
        source: source,
        target: target,
        type: "step",
      },
    ]);
    setHasUnsavedChanges(true);
  }, []);

  const isValidConnection = useCallback((connection: any) => {
    return connection.source !== connection.target;
  }, []);

  const onBeforeDelete = useCallback(
    async ({ nodes: nodesToDelete }: { nodes: Node[]; edges: Edge[] }) => {
      setDeletedNodes(null);
      try {
        if (nodesToDelete.length === 0 || 
          ![StepType.MultiChoiceQuestion, StepType.Condition, StepType.Input]
            .includes(nodesToDelete[0]?.data.stepType as StepType)) return true;

        const shouldPreventDelete = hasConnectedNodes(nodesToDelete[0].id);
        if (shouldPreventDelete) {
          setDeletedNodes(nodesToDelete);
          setIsDeleteConnectionsModalVisible(true);
        }
        return !shouldPreventDelete;
      } catch (error) {
        console.error("Error in onBeforeDelete:", error);
        return true;
      }
    },
    [hasConnectedNodes]
  );

  return (
    <>
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
        onEdgesDelete={(edges) => {
          onEdgesDelete(edges);
          setHasUnsavedChanges(true);
        }}
        onBeforeDelete={onBeforeDelete}
        onNodesDelete={(nodes) => {
          onNodesDelete(nodes);
          setHasUnsavedChanges(true);
        }}
        fitView
        fitViewOptions={{ padding: 5 }}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ type: "step", deletable: false }}
      >
        <MiniMap />
        <Background color="#D2D3D8" gap={16} lineWidth={9} />
        <Controls orientation="horizontal" showInteractive={false} />
      </ReactFlow>
      {isDeleteConnectionsModalVisible && (
        <Modal title={t("overview.popup.deleteNodeConnections")} onClose={onKeepItConfirmed}>
          <Track justify="end" gap={16}>
            <Button appearance="primary" onClick={onDeleteConfirmed}>
              {t("global.delete")}
            </Button>
            <Button appearance="primary" onClick={onKeepItConfirmed}>
              {t("global.keepIt")}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default FlowBuilder;
