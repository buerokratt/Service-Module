import { useReactFlow } from '@xyflow/react';
import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useRef, useCallback } from 'react';
import useServiceStore from 'store/new-services.store';
import { AiOutlineExport, AiOutlineImport } from 'react-icons/ai';
import useToastStore from 'store/toasts.store';
import { format } from 'date-fns';
import { removeTrailingUnderscores } from 'utils/string-util';
import { updateFlowInputRules } from 'services/flow-builder';

const ImportExportControls: FC = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges } = useServiceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serviceName = useServiceStore((state) => removeTrailingUnderscores(state.serviceNameDashed()));

  const handleExport = useCallback(() => {
    const dataString = JSON.stringify({ nodes: getNodes(), edges: getEdges() });
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataString);

    const fileName = `${serviceName != undefined && serviceName != '' ? serviceName : 'flow'}_${format(new Date(), 'yyyy_MM_dd_HH_mm_ss')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  }, [getNodes, getEdges]);

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const flowData = JSON.parse(content);

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
            setNodes(nodes);
            setEdges(flowData.edges);
            setHasUnsavedChanges(true);
          } else {
            useToastStore
              .getState()
              .error({ title: t('global.notificationError'), message: t('serviceFlow.invalidFileFormat') });
          }
        } catch (error) {
          console.error('Error parsing flow file:', error);
          useToastStore.getState().error({ title: t('serviceFlow.parseError'), message: (error as Error).message });
        }
      };
      reader.readAsText(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [setNodes, setEdges, setHasUnsavedChanges, t],
  );

  const isValidFlowData = (data: any): data is { nodes: any[]; edges: any[] } => {
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
  );
};

export default ImportExportControls;
