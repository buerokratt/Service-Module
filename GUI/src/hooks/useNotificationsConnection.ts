import { useNotificationsClient } from '@buerokratt-ria/notifications/react';
import { useEffect } from 'react';

const useNotificationsConnection = (enabled: boolean) => {
  const { connect, disconnect } = useNotificationsClient();

  useEffect(() => {
    if (!enabled) return;

    connect();
    return disconnect;
  }, [connect, disconnect, enabled]);
};

export default useNotificationsConnection;
