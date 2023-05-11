import React from 'react'
import { createRoot } from 'react-dom/client'
import './i18n';
import * as serviceWorker from './serviceWorker'
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import App from './App'
import api from './services/api';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
    const { data } = await api.get(queryKey[0] as string);
    return data;
  };
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: defaultQueryFn,
      },
    },
  });
const root = createRoot(document.getElementById('root')!)
root.render(
    <React.StrictMode>
     <QueryClientProvider client={queryClient}>
        <App />
     </QueryClientProvider>
    </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
