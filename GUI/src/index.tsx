import { createNotificationsClient } from '@buerokratt-ria/notifications';
import { NotificationsProvider } from '@buerokratt-ria/notifications/react';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';

import App from './App';
import apiAn from './services/analytics-api';
import api from './services/api';
import apiDev from './services/api-dev';
import apiDevV2 from './services/api-dev-v2';
import apigeneric from './services/apigeneric';
import auth from './services/auth';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
  if (import.meta.env.REACT_APP_LOCAL === 'true') {
    if (queryKey.includes('prod')) {
      const { data } = await apigeneric.get(queryKey[0] as string);
      return data.response;
    }
  }
  if (queryKey.includes('user-profile-settings')) {
    const { data } = await apiAn.get(queryKey[0] as string);
    return data;
  }
  if (queryKey.includes('prod')) {
    if (queryKey.includes('active-chats')) {
      const { data } = await apiDev.get('sse/' + (queryKey[0] as string), {
        headers: {
          Accept: 'text/event-stream',
        },
      });
      return data;
    } else {
      const { data } = await apiDev.get(queryKey[0] as string);
      return data;
    }
  }
  if (queryKey[1] === 'prod-2') {
    const { data } = await apiDevV2.get(queryKey[0] as string);
    return data?.response;
  }
  if (queryKey[1] === 'auth') {
    const { data } = await auth.get(queryKey[0] as string);
    return data;
  }

  const { data } = await api.get(queryKey[0] as string);
  return data;
};

const notificationsClient = createNotificationsClient({
  apiBaseUrl: import.meta.env.REACT_APP_NOTIFICATIONS_NODE_URL,
  vapidPublicKey: import.meta.env.REACT_APP_NOTIFICATIONS_VAPID_PUBLIC_KEY,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider client={notificationsClient}>
        <App />
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
