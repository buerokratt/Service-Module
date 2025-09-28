import { Background, Controls, Edge, MiniMap, Node, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { Button, Modal, Track } from 'components';
import Chat from 'components/chat/chat';
import edgeTypes from 'components/Flow/EdgeTypes';
import nodeTypes from 'components/Flow/NodeTypes';
import useLayout from 'hooks/flow/useLayout';
import { useOnNodesDelete } from 'hooks/flow/useOnNodeDelete';
import { FC, useCallback } from 'react';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';
import useServiceStore from 'store/new-services.store';
import { StepType } from 'types';
import ImportExportControls from 'components/Flow/Controls/ImportExportControls';
import UndoRedoControls from 'components/Flow/Controls/UndoRedoControls';

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
};

const FlowBuilder: FC<FlowBuilderProps> = ({ nodes, edges }) => {
  useLayout();
  const { getNodes, getEdges, setNodes, setEdges, getNode } = useReactFlow();
  const setReactFlowInstance = useServiceStore((state) => state.setReactFlowInstance);
  const { t } = useTranslation();
  const {
    onNodesDelete,
    onEdgesDelete,
    isDeleteConnectionsModalVisible,
    setIsDeleteConnectionsModalVisible,
    onDeleteConfirmed,
    onKeepItConfirmed,
    hasConnectedNodes,
    setDeletedNodes,
    setNodeToDelete,
  } = useOnNodesDelete();
  const { setHasUnsavedChanges, saveToHistory } = useServiceStore();

  const onConnect = useCallback(
    ({ source, target }: any) => {
      const nodes = getNodes();
      const edges = getEdges();

      const parentOutgoingEdges = edges.filter((edge) => edge.source === source);

      const ghostEdges = parentOutgoingEdges.filter((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        return targetNode?.type === 'ghost';
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
          type: 'step',
        },
      ]);
      setHasUnsavedChanges(true);
      saveToHistory();
    },
    [getEdges, getNodes, setEdges, setHasUnsavedChanges, setNodes, saveToHistory],
  );

  const isValidConnection = useCallback((connection: any) => {
    return connection.source !== connection.target;
  }, []);

  const onBeforeDelete = useCallback(
    ({ nodes: nodesToDelete, edges: edgesToDelete }: { nodes: Node[]; edges: Edge[] }) => {
      setDeletedNodes(null);
      try {
        if (edgesToDelete.length > 0 && nodesToDelete.length === 0) {
          const shouldPreventDelete = getNode(edgesToDelete[0].source)?.data.stepType === StepType.MultiChoiceQuestion;
          if (shouldPreventDelete) {
            return Promise.resolve(false);
          }
        }

        if (
          nodesToDelete.length === 0 ||
          ![StepType.MultiChoiceQuestion, StepType.Condition, StepType.Input].includes(
            nodesToDelete[0]?.data.stepType as StepType,
          )
        )
          return Promise.resolve(true);

        const shouldPreventDelete = hasConnectedNodes(nodesToDelete[0].id);
        if (shouldPreventDelete) {
          setDeletedNodes(nodesToDelete);
          setIsDeleteConnectionsModalVisible(true);
        }
        return Promise.resolve(!shouldPreventDelete);
      } catch (error) {
        console.error('Error in onBeforeDelete:', error);
        return Promise.resolve(true);
      }
    },
    [getNode, hasConnectedNodes, setDeletedNodes, setIsDeleteConnectionsModalVisible],
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
        onInit={(instance) => {
          setReactFlowInstance(instance);
          useServiceStore.getState().loadEndpointsResponseVariables();
        }}
        nodesDraggable={false}
        onConnect={onConnect}
        onEdgesDelete={(edges) => {
          onEdgesDelete(edges);
          setHasUnsavedChanges(true);
          saveToHistory();
        }}
        onBeforeDelete={onBeforeDelete}
        onNodesDelete={(nodes) => {
          onNodesDelete(nodes);
          setHasUnsavedChanges(true);
          saveToHistory();
        }}
        fitView
        fitViewOptions={{ padding: 5 }}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ type: 'step', deletable: false }}
      >
        <Chat />
        <MiniMap />
        <Background color="#D2D3D8" gap={16} lineWidth={9} />
        <Controls orientation="horizontal" showInteractive={false} />
        <Panel position="top-left">
          <Track gap={10} direction="vertical" align="left">
            <ImportExportControls />
            <UndoRedoControls />
          </Track>
        </Panel>
      </ReactFlow>
      {isDeleteConnectionsModalVisible && (
        <Modal
          title={t('overview.popup.deleteNodeConnections')}
          onClose={() => {
            setNodeToDelete(null);
            setIsDeleteConnectionsModalVisible(false);
          }}
        >
          <Track justify="end" gap={16}>
            <Button appearance="primary" onClick={onDeleteConfirmed}>
              {t('global.delete')}
            </Button>
            <Button appearance="primary" onClick={onKeepItConfirmed}>
              {t('global.keepIt')}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default FlowBuilder;
