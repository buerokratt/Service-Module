import { useReactFlow } from '@xyflow/react';
import { Button, Icon, Track } from 'components';
import { useTranslation } from 'react-i18next';
import { FC, useRef, useCallback } from 'react';
import useServiceStore from 'store/new-services.store';
import { AiOutlineExport, AiOutlineImport } from 'react-icons/ai';
import useToastStore from 'store/toasts.store';

const ImportExportControls: FC = () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const { t } = useTranslation();
  const { setHasUnsavedChanges } = useServiceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const flowData = {
      nodes: getNodes(),
      edges: getEdges(),
      metadata: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
      },
    };

    const dataString = JSON.stringify(flowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataString);

    const fileName = `flow-export-${new Date().toISOString().split('T')[0]}.json`;

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
            setNodes(flowData.nodes);
            setEdges(flowData.edges);
            setHasUnsavedChanges(true);
          } else {
            useToastStore.getState().error({ title: t('global.notificationError'), message: t('serviceFlow.invalidFileFormat') } );
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
    <Track style={{ gap: 8, padding: 10 }} align="center" justify="start">
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
