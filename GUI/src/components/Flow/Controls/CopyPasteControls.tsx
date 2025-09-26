import { useReactFlow, Node, Edge } from '@xyflow/react';
import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useCallback, useEffect, useState } from 'react';
import useServiceStore from 'store/new-services.store';
import { MdContentCopy, MdContentPaste, MdContentCut } from 'react-icons/md';
import useToastStore from 'store/toasts.store';
import { generateUniqueId, generateUniqueLabel } from 'utils/flow-utils';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

const CopyPasteControls: FC = () => {
  const { getNodes, getEdges, setNodes, setEdges, getViewport } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges } = useServiceStore();
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);
  const selectedNodes = useServiceStore((state) => state.flowSelectedNodes);
  const reactFlowInstance = useServiceStore.getState().reactFlowInstance;

  const copyNodes = useCallback(() => {
    if (selectedNodes.length === 0) {
      useToastStore.getState().warning({ title: t('serviceFlow.noNodesSelected') });
      return;
    }

    const selectedNodeIds = selectedNodes.map((node) => node.id);
    const internalEdges = getEdges().filter(
      (edge) => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target),
    );

    const clipboardData: ClipboardData = {
      nodes: selectedNodes.map((node) => ({ ...node })),
      edges: internalEdges,
    };

    setClipboardData(clipboardData);

    useToastStore.getState().success({
      title: t('serviceFlow.nodesCopied', { count: selectedNodes.length, s: selectedNodes.length > 1 ? 's' : '' }),
    });
  }, [selectedNodes, getNodes, getEdges]);

  const pasteNodes = useCallback(() => {
    if (!clipboardData) {
      useToastStore.getState().warning({ title: t('serviceFlow.nothingToPaste') });
      return;
    }

    const currentNodes = getNodes();
    const idMap = new Map<string, string>();
    const processedLabels = new Set<string>();

    const newNodes = clipboardData.nodes.map((node) => {
      const newId = generateUniqueId();
      idMap.set(node.id, newId);

      const allExistingNodes = [...currentNodes];
      processedLabels.forEach((label) => {
        allExistingNodes.push({
          id: 'virtual',
          data: { label },
        } as any);
      });

      const uniqueLabel = generateUniqueLabel(node.data.label as string, allExistingNodes);
      processedLabels.add(uniqueLabel);

      return {
        ...node,
        id: newId,
        selected: false,
        data: {
          ...node.data,
          label: uniqueLabel,
          onDelete: useServiceStore.getState().onDelete,
          setClickedNode: useServiceStore.getState().setClickedNode,
          onEdit: useServiceStore.getState().handleNodeEdit,
        },
      };
    });

    const newEdges = clipboardData.edges.map((edge) => ({
      ...edge,
      id: generateUniqueId(),
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target,
    }));

    const endNodes = clipboardData.nodes.filter((node) => !clipboardData.edges.some((edge) => edge.source === node.id));

    const ghostNodes: Node[] = [];
    const ghostEdges: Edge[] = [];

    endNodes.forEach((endNode) => {
      const newEndNodeId = idMap.get(endNode.id);
      if (newEndNodeId) {
        const ghostNode: Node = {
          id: generateUniqueId(),
          type: 'ghost',
          position: {
            x: endNode.position.x,
            y: endNode.position.y,
          },
          data: { type: 'ghost' },
          className: 'ghost',
          selectable: false,
          draggable: false,
        };

        const ghostEdge: Edge = {
          id: generateUniqueId(),
          source: newEndNodeId,
          target: ghostNode.id,
          type: 'step',
          animated: true,
          deletable: false,
          label: '+',
        };

        ghostNodes.push(ghostNode);
        ghostEdges.push(ghostEdge);
      }
    });

    setNodes((prevNodes) => [...prevNodes, ...newNodes, ...ghostNodes]);
    setEdges((prevEdges) => [...prevEdges, ...newEdges, ...ghostEdges]);
    setHasUnsavedChanges(true);

    useToastStore
      .getState()
      .success({ title: t('serviceFlow.nodesPasted', { count: newNodes.length, s: newNodes.length > 1 ? 's' : '' }) });
  }, [clipboardData, getNodes, getEdges, getViewport, generateUniqueId, setNodes, setEdges, setHasUnsavedChanges]);

  const cutNodes = useCallback(() => {
    if (selectedNodes.length === 0) {
      useToastStore.getState().warning({ title: t('serviceFlow.noNodesSelected') });
      return;
    }
    copyNodes();
    reactFlowInstance?.deleteElements({ nodes: selectedNodes });
    setHasUnsavedChanges(true);

    useToastStore.getState().success({
      title: t('serviceFlow.nodesCut', { count: selectedNodes.length, s: selectedNodes.length > 1 ? 's' : '' }),
    });
  }, [selectedNodes, copyNodes, getNodes, getEdges, setNodes, setEdges, setHasUnsavedChanges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key === 'c' && !event.shiftKey) {
        event.preventDefault();
        copyNodes();
      } else if (isCtrlOrCmd && event.key === 'v' && !event.shiftKey) {
        event.preventDefault();
        pasteNodes();
      } else if (isCtrlOrCmd && event.key === 'x' && !event.shiftKey) {
        event.preventDefault();
        cutNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copyNodes, pasteNodes, cutNodes]);

  return (
    <Track style={{ gap: 8 }} align="center" justify="start">
      <Button
        onClick={copyNodes}
        size="s"
        disabled={selectedNodes.length === 0}
        title={t('serviceFlow.copyNodes').toString()}
      >
        <Icon icon={<MdContentCopy />} />
        {t('global.copy')}
      </Button>
      <Button onClick={pasteNodes} size="s" disabled={!clipboardData} title={t('serviceFlow.pasteNodes').toString()}>
        <Icon icon={<MdContentPaste />} />
        {t('global.paste')}
      </Button>
      <Button
        onClick={cutNodes}
        size="s"
        disabled={selectedNodes.length === 0}
        title={t('serviceFlow.cutNodes').toString()}
      >
        <Icon icon={<MdContentCut />} />
        {t('global.cut')}
      </Button>
    </Track>
  );
};

export default CopyPasteControls;
