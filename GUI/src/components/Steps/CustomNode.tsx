import { FC } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { MdDeleteOutline, MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';

import { Box, Button, Icon, Track } from '../';
import StepNode from './StepNode';
import './Node.scss';

type NodeDataProps = {
  data: {
    label: string;
    onDelete: (id: string) => void;
    type: string;
  }
}

const CustomNode: FC<NodeProps & NodeDataProps> = (props) => {
  const { t } = useTranslation();
  const { data, isConnectable, id, selected } = props;

  return (
    selected ? 
    <div className='selected'>
    
    <Handle
      type='target'
      position={Position.Top}
      isConnectable={isConnectable}
      style={{display: 'none'}}
    />

    <Box color={data.type === "finishing-step" ? "red" : "blue"}>
      <Track direction='horizontal' gap={4} align='left'>
        <StepNode data={data} />
        <Button appearance="text">
            <Icon icon={<MdOutlineEdit />} size="medium" />
            {t("overview.edit")}
          </Button>
          <Button
            appearance="text"
            onClick={() => data.onDelete(id)}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
      </Track>
    </Box>


    <Handle
      type='source'
      position={Position.Bottom}
      isConnectable={isConnectable}
    />
      </div>

    :
    <>
      <Handle
        type='target'
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <Track direction='horizontal' gap={4} align='left'>
         <StepNode data={data} />
        <Button appearance="text">
            <Icon icon={<MdOutlineEdit />} size="medium" />
            {t("overview.edit")}
          </Button>
          <Button
            appearance="text"
            onClick={() => data.onDelete(id)}
          >
            <Icon icon={<MdDeleteOutline />} size="medium" />
            {t("overview.delete")}
          </Button>
      </Track>

      <Handle
        type='source'
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default CustomNode;
