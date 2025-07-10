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
  const { getNodes, setEdges } = useReactFlow();
  const setReactFlowInstance = useServiceStore((state) => state.setReactFlowInstance);
  const { t } = useTranslation();
  const { onNodesDelete, isDeleteConnectionsModalVisible, setIsDeleteConnectionsModalVisible, onDeleteConfirmed, onKeepItConfirmed, hasConnectedNodes, setDeletedNodes } =
    useOnNodesDelete();

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
        onBeforeDelete={onBeforeDelete}
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
