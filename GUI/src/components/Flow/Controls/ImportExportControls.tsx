import { useReactFlow } from '@xyflow/react';
import { Button, Icon, Modal, Track } from 'components';
import { format } from 'date-fns';
import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineExport, AiOutlineImport } from 'react-icons/ai';
import api from 'services/api';
import { updateFlowInputRules } from 'services/flow-builder';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { FlowData } from 'types/service-flow';
import { appendFlowNodes } from 'utils/append-flow-nodes';
import {
  applyServiceSettings,
  buildServiceSettingsFromStore,
  isValidFlowData,
  parseFlowArtifact,
  serializeFlowArtifact,
} from 'utils/service-flow-artifact';
import { removeTrailingUnderscores } from 'utils/string-util';
import { checkImportNames } from 'resources/api-constants';

const ImportExportControls: FC = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges, saveToHistory, setNodes: setStoreNodes, setEdges: setStoreEdges } = useServiceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));
  const [isConfirmImportModalVisible, setIsConfirmImportModalVisible] = useState(false);
  const [importedFlowData, setImportedFlowData] = useState<FlowData | null>(null);

  const handleExport = useCallback(async () => {
    try {
      const dataString = serializeFlowArtifact(getNodes(), getEdges(), buildServiceSettingsFromStore());
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
    (flowData: FlowData, settings?: FlowData['settings']) => {
      if (isValidFlowData(flowData)) {
        applyServiceSettings(settings);
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

  const resolveImportedName = useCallback(async (title: string): Promise<string> => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await api.post(checkImportNames(), { names: title, timezone });
      return (res.data as { names?: string })?.names ?? title;
    } catch {
      return title;
    }
  }, []);

  const handleImport = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const { nodes, edges, settings } = parseFlowArtifact(content);
          const flowData = { nodes, edges } as FlowData;

          const resolvedSettings = settings?.title
            ? { ...settings, title: await resolveImportedName(settings.title) }
            : settings;

          const currentNodes = getNodes().filter((node) => node.type !== 'ghost');

          if (currentNodes.length === 1 && currentNodes[0].type === 'start') {
            applyImportedFlow(flowData, resolvedSettings);
          } else {
            setImportedFlowData({ ...flowData, settings: resolvedSettings });
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
    [getNodes, applyImportedFlow, resolveImportedName, t],
  );

  const closeImportModal = useCallback(() => {
    setIsConfirmImportModalVisible(false);
    setImportedFlowData(null);
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (importedFlowData) {
      const { settings, ...flowData } = importedFlowData;
      applyImportedFlow(flowData, settings);
    }
    closeImportModal();
  }, [importedFlowData, applyImportedFlow, closeImportModal]);

  const handleImportFlowOnly = useCallback(() => {
    if (!importedFlowData) {
      closeImportModal();
      return;
    }

    const { nodes, edges } = appendFlowNodes(getNodes(), getEdges(), importedFlowData.nodes, importedFlowData.edges);
    saveToHistory();
    setStoreNodes(nodes);
    setStoreEdges(edges);
    setNodes(nodes);
    setEdges(edges);
    saveToHistory({ nodes, edges });
    setHasUnsavedChanges(true);
    closeImportModal();
  }, [
    importedFlowData,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    setStoreNodes,
    setStoreEdges,
    setHasUnsavedChanges,
    saveToHistory,
    closeImportModal,
  ]);

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
        <Modal title={t('serviceFlow.popup.confirmImport')} onClose={closeImportModal}>
          <Track justify="end" gap={16}>
            <Button appearance="primary" onClick={handleConfirmImport}>
              {t('global.proceed')}
            </Button>
            <Button onClick={handleImportFlowOnly}>{t('serviceFlow.popup.importFlowOnly')}</Button>
            <Button appearance="secondary" onClick={closeImportModal}>
              {t('global.cancel')}
            </Button>
          </Track>
        </Modal>
      )}
    </>
  );
};

export default ImportExportControls;
