import { Background, ColorMode, Controls, Edge, MiniMap, Node, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { Button, Modal, ThemeToggle, Tooltip, Track } from 'components';
import Chat from 'components/chat/chat';
import CopyPasteControls from 'components/Flow/Controls/CopyPasteControls';
import ImportExportControls from 'components/Flow/Controls/ImportExportControls';
import LassoSelectionControls from 'components/Flow/Controls/LassoSelectionControls';
import UndoRedoControls from 'components/Flow/Controls/UndoRedoControls';
import edgeTypes from 'components/Flow/EdgeTypes';
import { Lasso } from 'components/Flow/LassoSelection/Lasso';
import nodeTypes from 'components/Flow/NodeTypes';
import useLayout from 'hooks/flow/useLayout';
import { useOnNodesDelete } from 'hooks/flow/useOnNodeDelete';
import { ChangeEventHandler, FC, useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';
import useNewServiceStore from 'store/new-services.store';
import useServiceStore from 'store/services.store';
import { StepType } from 'types';
import '../Flow/LassoSelection/Lasso.css';

import { useThemeSyncWithFlow } from '../../hooks/useThemeSyncWithFlow';
import HorizontalFlow from '../../static/icons/horizontal_flow.svg';
import VerticalFlow from '../../static/icons/vertical_flow.svg';

type FlowBuilderProps = {
  nodes: Node[];
  edges: Edge[];
};

const FlowBuilder: FC<FlowBuilderProps> = ({ nodes, edges }) => {
  useLayout();
  const { getNodes, getEdges, setNodes, setEdges, getNode } = useReactFlow();
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const setReactFlowInstance = useNewServiceStore((state) => state.setReactFlowInstance);
  const { t } = useTranslation();

  useThemeSyncWithFlow();

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
  const [isLassoActive, setIsLassoActive] = useState(false);
  const { saveToHistory, historyIndex, setFlowSelectedNodes, setHasUnsavedChanges } = useNewServiceStore();
  const orientation = useServiceStore((state) => state.orientation);
  const toggleOrientation = useServiceStore((state) => state.toggleOrientation);
  useLayout(orientation);

  const { runLayout } = useLayout();

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

  const zIndexStyle = { zIndex: 20 };

  const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    setColorMode(evt.target.value as ColorMode);
  };

  const isValidConnection = useCallback((connection: any) => {
    return connection.source !== connection.target;
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setFlowSelectedNodes(selectedNodes);
      setHasUnsavedChanges(true);
    },
    [setFlowSelectedNodes, setHasUnsavedChanges],
  );

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

  const handleToggleLasso = useCallback(() => {
    setIsLassoActive((prev) => !prev);
  }, []);

  useEffect(() => {
    runLayout();
  }, [historyIndex, runLayout]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={useNewServiceStore.getState().onNodesChange}
        onEdgesChange={useNewServiceStore.getState().onEdgesChange}
        snapToGrid
        proOptions={{ hideAttribution: true }}
        panOnScroll
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          useNewServiceStore.getState().loadEndpointsResponseVariables();
        }}
        nodesDraggable={false}
        onSelectionChange={onSelectionChange}
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
        colorMode={colorMode}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ type: 'step', deletable: false }}
      >
        <Chat />
        <MiniMap style={zIndexStyle} />
        <Background color="#D2D3D8" gap={16} lineWidth={9} />
        <Controls orientation="horizontal" showInteractive={false} style={zIndexStyle} />
        {isLassoActive && <Lasso />}
        <Panel position="top-left" style={zIndexStyle}>
          <Track gap={10} direction="vertical" align="left">
            <ImportExportControls />
            <CopyPasteControls onNodesDelete={onNodesDelete} />
            <UndoRedoControls />
          </Track>
        </Panel>
        <Controls orientation="horizontal" showInteractive={false} />
        <Panel position="top-right" style={{ zIndex: 20, paddingRight: '90px' }}>
          <LassoSelectionControls isLassoActive={isLassoActive} onToggleLasso={handleToggleLasso} />
          <ThemeToggle onChange={onChange} />
          <Tooltip content={t('serviceFlow.orientationTooltip')}>
            <Button onClick={toggleOrientation} size="s" style={{ backgroundColor: '#005aa3', height: '36px' }}>
              <img
                src={orientation === 'horizontal' ? HorizontalFlow : VerticalFlow}
                width={32}
                className="logo"
                loading="eager"
                alt="orientation toggle"
              />
            </Button>
          </Tooltip>
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
