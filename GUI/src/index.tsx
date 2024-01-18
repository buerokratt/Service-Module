import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import './i18n';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import App from './App'
import api from './services/api';
import {mockApi} from "./services/mock-apis";
import apiDev from "./services/api-dev";
import apiDevV2 from "./services/api-dev-v2";
import auth from "./services/auth";
import apigeneric from "./services/apigeneric";
import apiAn from './services/analytics-api';
import * as mocks from "./services/mockHandlers";

mocks

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
            const {data} = await apiDev.get('sse/'+ (queryKey[0] as string), {
                headers: {
                    "Accept": 'text/event-stream'
                }});
            return data;
        } else {
            const {data} = await apiDev.get(queryKey[0] as string);
            return data;
        }
    }
    if (queryKey[1] === 'prod-2') {
        const { data } = await apiDevV2.get(queryKey[0] as string);
        return data?.response;
    }
    if(queryKey[1] === 'auth') {
        const { data } = await auth.get(queryKey[0] as string);
        return data;
    }

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
