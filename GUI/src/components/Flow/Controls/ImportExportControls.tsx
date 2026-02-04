import { useReactFlow } from '@xyflow/react';
import { Button, Icon, Modal, Track } from 'components';
import { format } from 'date-fns';
import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineExport, AiOutlineImport } from 'react-icons/ai';
import { updateFlowInputRules } from 'services/flow-builder';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { FlowData } from 'types/service-flow';
import { removeTrailingUnderscores } from 'utils/string-util';

const ImportExportControls: FC = () => {
  const { getNodes, getEdges } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges, saveToHistory, setNodes: setStoreNodes, setEdges: setStoreEdges } = useServiceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const [isConfirmImportModalVisible, setIsConfirmImportModalVisible] = useState(false);
  const [importedFlowData, setImportedFlowData] = useState<FlowData | null>(null);

  const handleExport = useCallback(async () => {
    try {
      const dataString = JSON.stringify({ nodes: getNodes(), edges: getEdges() });
      const fileName = `${serviceName != undefined && serviceName != '' ? serviceName : 'flow'}_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;

      if ('showSaveFilePicker' in window) {
        try {
          const blob = new Blob([dataString], { type: 'application/json' });
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });

          const writableStream = await handle.createWritable();
          await writableStream.write(blob);
          await writableStream.close();
        } catch (error: any) {
          console.error(error);
        }
      } else {
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataString);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
      }
    } catch (error) {
      useToastStore.getState().error({ title: t('global.notificationError'), message: (error as Error).message });
    }
  }, [getNodes, getEdges, serviceName, t]);

  const applyImportedFlow = useCallback(
    (flowData: FlowData) => {
      if (isValidFlowData(flowData)) {
        const nodes = flowData.nodes.map((node: any) => {
          if (node.type !== 'custom') return node;
          node.data = {
            ...node.data,
            onDelete: useServiceStore.getState().onDelete,
            setClickedNode: useServiceStore.getState().setClickedNode,
            onEdit: useServiceStore.getState().handleNodeEdit,
            update: updateFlowInputRules,
          };
          return node;
        });
        saveToHistory();
        setStoreNodes(nodes);
        setStoreEdges(flowData.edges);
        saveToHistory({ nodes, edges: flowData.edges });
        setHasUnsavedChanges(true);
      } else {
        useToastStore.getState().error({ title: t('global.notificationError'), message: t('serviceFlow.parseError') });
      }
    },
    [setStoreNodes, setStoreEdges, setHasUnsavedChanges, saveToHistory, t],
  );

  const handleImport = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const flowData = JSON.parse(content) as FlowData;
          const currentNodes = getNodes().filter((node) => node.type !== 'ghost');

          if (currentNodes.length === 1 && currentNodes[0].type === 'start') {
            applyImportedFlow(flowData);
          } else {
            setImportedFlowData(flowData);
            setIsConfirmImportModalVisible(true);
          }
        } catch (error) {
          console.error('Error parsing flow file:', error);
          useToastStore
            .getState()
            .error({ title: t('global.notificationError'), message: t('serviceFlow.parseError') });
        }
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [getNodes, applyImportedFlow, t],
  );

  const handleConfirmImport = useCallback(() => {
    if (importedFlowData) {
      applyImportedFlow(importedFlowData);
    }
    setIsConfirmImportModalVisible(false);
    setImportedFlowData(null);
  }, [importedFlowData, applyImportedFlow]);

  const handleCancelImport = useCallback(() => {
    setIsConfirmImportModalVisible(false);
    setImportedFlowData(null);
  }, []);

  const isValidFlowData = (data: any): data is FlowData => {
    return (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      data.nodes.every((node: any) => node.id && node.type) &&
      data.edges.every((edge: any) => edge.id && edge.source && edge.target)
    );
  };

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <>
      <Track style={{ gap: 8 }} align="center" justify="start">
        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" style={{ display: 'none' }} />
        <Button onClick={triggerFileInput} size="s" style={{ backgroundColor: '#308653' }}>
          <Icon icon={<AiOutlineImport />} />
          {t('global.import')}
        </Button>
        <Button onClick={handleExport} size="s">
          <Icon icon={<AiOutlineExport />} />
          {t('global.export')}
        </Button>
      </Track>
      {isConfirmImportModalVisible && (
        <Modal title={t('serviceFlow.popup.confirmImport')} onClose={handleCancelImport}>
          <Track justify="end" gap={16}>
            <Button appearance="primary" onClick={handleConfirmImport}>
              {t('global.proceed')}
            </Button>
            <Button appearance="secondary" onClick={handleCancelImport}>
              {t('global.cancel')}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default ImportExportControls;
