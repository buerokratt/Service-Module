import Tooltip from 'components/Tooltip';
import { fromUpperSnakeCase } from 'utils/string-util';

interface StatusIndicatorProps {
  status: string;
  size?: number;
}

const StatusIndicator = ({ status, size = 8 }: StatusIndicatorProps) => {
  const backgroundColor = status === 'TRAINED' ? '#4CAF50' : '#F44336';

  return (
    <Tooltip content={fromUpperSnakeCase(status)}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor,
          cursor: 'pointer',
        }}
      />
    </Tooltip>
  );
};

export default StatusIndicator;
