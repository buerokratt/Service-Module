import { useReactFlow, Node, Edge } from '@xyflow/react';
import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useCallback, useEffect, useState } from 'react';
import useServiceStore from 'store/new-services.store';
import { MdContentCopy, MdContentPaste, MdContentCut } from 'react-icons/md';
import useToastStore from 'store/toasts.store';
import { generateUniqueId, generateUniqueLabel } from 'utils/flow-utils';
import { StepType } from 'types';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

interface CopyPasteControlsProps {
  onNodesDelete?: (nodes: Node[]) => void;
}

const CopyPasteControls: FC<CopyPasteControlsProps> = ({ onNodesDelete }) => {
  const { getNodes, getEdges, setNodes, setEdges, getViewport } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges } = useServiceStore();
  const [hasClipboardData, setHasClipboardData] = useState<boolean>(false);
  const selectedNodes = useServiceStore((state) => state.flowSelectedNodes);
  const reactFlowInstance = useServiceStore.getState().reactFlowInstance;

  const isClipboardSupported = () => {
    return navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
  };

  const checkClipboardPermissions = async () => {
    if (!isClipboardSupported()) return false;

    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return permission.state === 'granted' || permission.state === 'prompt';
    } catch (error) {
      console.warn('Clipboard permissions query not supported:', error);
      return true;
    }
  };

  const [fallbackClipboardData, setFallbackClipboardData] = useState<ClipboardData | null>(null);

  const copyNodes = useCallback(
    async (showToast = true) => {
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

      try {
        if (isClipboardSupported() && (await checkClipboardPermissions())) {
          const jsonData = JSON.stringify(clipboardData);
          await navigator.clipboard.writeText(jsonData);
          setHasClipboardData(true);
        } else {
          setFallbackClipboardData(clipboardData);
          setHasClipboardData(true);
        }

        if (showToast) {
          useToastStore.getState().success({
            title: t('serviceFlow.nodesCopied', {
              count: selectedNodes.length,
              s: selectedNodes.length > 1 ? 's' : '',
            }),
          });
        }
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        setFallbackClipboardData(clipboardData);
        setHasClipboardData(true);

        if (showToast) {
          useToastStore.getState().success({
            title: t('serviceFlow.nodesCopied', {
              count: selectedNodes.length,
              s: selectedNodes.length > 1 ? 's' : '',
            }),
          });
        }
      }
    },
    [selectedNodes, getNodes, getEdges],
  );

  const pasteNodes = useCallback(async () => {
    let clipboardData: ClipboardData | null = null;

    try {
      if (isClipboardSupported()) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          try {
            clipboardData = JSON.parse(clipboardText) as ClipboardData;
            if (!clipboardData.nodes || !Array.isArray(clipboardData.nodes)) {
              clipboardData = null;
            }
          } catch (parseError) {
            console.warn('Failed to parse clipboard data:', parseError);
            clipboardData = null;
          }
        }
      } else {
        clipboardData = fallbackClipboardData;
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      clipboardData = fallbackClipboardData;
    }

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

    const createGhostBranch = (node: Node, newId: string, label: string, index: number) => {
      const ghostNode: Node = {
        id: generateUniqueId(),
        type: 'ghost',
        position: {
          x: node.position.x + 200,
          y: node.position.y + (index * 100),
        },
        data: { type: 'ghost' },
        className: 'ghost',
        selectable: false,
        draggable: false,
      };

      const ghostEdge: Edge = {
        id: generateUniqueId(),
        source: newId,
        target: ghostNode.id,
        type: 'step',
        animated: true,
        deletable: false,
        label: label,
      };

      ghostNodes.push(ghostNode);
      ghostEdges.push(ghostEdge);
    };

    const processConditionLabel = (node: Node, newId: string, label: string, index: number) => {
      const hasExistingBranch = clipboardData.edges.some(edge => 
        edge.source === node.id && edge.label === label
      );
      if (!hasExistingBranch) {
        createGhostBranch(node, newId, label, index);
      }
    };

    const processMultiChoiceButton = (node: Node, newId: string, button: any, index: number) => {
      const hasExistingBranch = clipboardData.edges.some(edge => 
        edge.source === node.id && edge.label === button.title
      );
      if (!hasExistingBranch) {
        createGhostBranch(node, newId, button.title, index);
      }
    };

    const createConditionBranches = (node: Node, newId: string) => {
      const labels = ['Success', 'Failure'];
      labels.forEach((label, index) => processConditionLabel(node, newId, label, index));
    };

    const createMultiChoiceBranches = (node: Node, newId: string) => {
      const multiChoiceData = node.data?.multiChoiceQuestion as any;
      const buttons = multiChoiceData?.buttons || [
        { id: '1', title: 'Jah' },
        { id: '2', title: 'Ei' }
      ];
      buttons.forEach((button: any, index: number) => processMultiChoiceButton(node, newId, button, index));
    };

    const createBranchesForNode = (node: Node, newId: string) => {
      const stepType = node.data?.stepType;
      
      if (stepType === StepType.Condition || stepType === StepType.Input) {
        createConditionBranches(node, newId);
      } else if (stepType === StepType.MultiChoiceQuestion) {
        createMultiChoiceBranches(node, newId);
      }
    };

    clipboardData.nodes.forEach((node) => {
      const newId = idMap.get(node.id);
      if (newId) {
        createBranchesForNode(node, newId);
      }
    });

    endNodes.forEach((endNode) => {
      const newEndNodeId = idMap.get(endNode.id);
      if (newEndNodeId) {
        const stepType = endNode.data?.stepType;

        if (
          stepType === StepType.FinishingStepEnd ||
          stepType === StepType.FinishingStepRedirect ||
          stepType === StepType.DynamicChoices ||
          stepType === StepType.Condition ||
          stepType === StepType.Input ||
          stepType === StepType.MultiChoiceQuestion
        ) {
          return;
        }

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
  }, [fallbackClipboardData, getNodes, getEdges, getViewport, setNodes, setEdges, setHasUnsavedChanges]);

  const cutNodes = useCallback(async () => {
    if (selectedNodes.length === 0) {
      useToastStore.getState().warning({ title: t('serviceFlow.noNodesSelected') });
      return;
    }
    await copyNodes(false);
    
    if (onNodesDelete) {
      onNodesDelete(selectedNodes);
    } else {
      reactFlowInstance?.deleteElements({ nodes: selectedNodes });
    }
    
    setHasUnsavedChanges(true);

    useToastStore.getState().success({
      title: t('serviceFlow.nodesCut', { count: selectedNodes.length, s: selectedNodes.length > 1 ? 's' : '' }),
    });
  }, [selectedNodes, copyNodes, onNodesDelete, getNodes, getEdges, setNodes, setEdges, setHasUnsavedChanges]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key === 'c' && !event.shiftKey) {
        event.preventDefault();
        await copyNodes();
      } else if (isCtrlOrCmd && event.key === 'v' && !event.shiftKey) {
        event.preventDefault();
        await pasteNodes();
      } else if (isCtrlOrCmd && event.key === 'x' && !event.shiftKey) {
        event.preventDefault();
        await cutNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copyNodes, pasteNodes, cutNodes]);

  return (
    <Track style={{ gap: 8 }} align="center" justify="start">
      <Button
        onClick={() => copyNodes(true)}
        size="s"
        disabled={selectedNodes.length === 0}
        title={t('serviceFlow.copyNodes').toString()}
      >
        <Icon icon={<MdContentCopy />} />
        {t('global.copy')}
      </Button>
      <Button onClick={pasteNodes} size="s" disabled={!hasClipboardData} title={t('serviceFlow.pasteNodes').toString()}>
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
