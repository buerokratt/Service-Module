import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import './i18n';
import * as serviceWorker from './serviceWorker'
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import App from './App'
import api from './services/api';
import { handlers } from './mocks/handlers';
import {setupWorker} from "msw";

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

const worker = setupWorker(...handlers);

const prepare = async () => {
    return worker.start({
        serviceWorker: {
            url: './mockServiceWorker.js'
        }

    });

    /*   if (import.meta.env.MODE === 'development') {
        // return worker.start();
        return worker.start({
          serviceWorker: {
            url: 'burokratt/mockServiceWorker.js'
          }
        });
      }
      return Promise.resolve(); */
};



// IF mocking is enabled then it would wrap base with mocking part
if(import.meta.env.REACT_APP_MOCK_ENABLED === 'true') {
    prepare().then(() => {
        ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
            <React.StrictMode>
                <QueryClientProvider client={queryClient}>
                    {/* <BrowserRouter basename="/burokratt"> */}
                    {/*<BrowserRouter basename={import.meta.env.BASE_URL}>*/}
                    {/*    <ToastProvider>*/}
                    <App/>
                    {/*</ToastProvider>*/}
                    {/*</BrowserRouter>*/}
                </QueryClientProvider>
            </React.StrictMode>,
        );
    });
} else {
    const root = createRoot(document.getElementById('root')!)
    root.render(
        <React.StrictMode>
         <QueryClientProvider client={queryClient}>
            <App />
         </QueryClientProvider>
        </React.StrictMode>
    )
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
