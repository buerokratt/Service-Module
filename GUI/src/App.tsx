import { useQuery } from '@tanstack/react-query';
import UnsavedChangesDialog from 'handlers/unsavedChangesDialog';
import { UnsavedChangesHandler } from 'handlers/unsavedChangesHandler';
import React, {useEffect} from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ToastProvider } from './components/Toast/ToastProvider';
import RootComponent from './RootComponent';
import useStore from './store/store';
import { UserInfo } from './types/userInfo';
import {CHAT_SESSIONS} from "./constants/consts";
import {generateUEID} from "./utils/generateUEID";

const App: React.FC = () => {
  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ['userinfo', 'prod'],
    onSuccess: (res: any) => {
      return useStore.getState().setUserInfo(res.data);
    },
    enabled: import.meta.env.REACT_APP_LOCAL === 'true',
  });

  useQuery({
    queryKey: [import.meta.env.REACT_APP_AUTH_PATH, 'auth'],
    onSuccess: (res: { response: UserInfo }) => {
      localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
      return useStore.getState().setUserInfo(res.response);
    },
    enabled: import.meta.env.REACT_APP_LOCAL !== 'true',
  });

  // useEffect(() => {
  //   const delay = 1000;

  //   const timeOutId = setTimeout(() => {
  //     initializeSession();
  //   }, delay);

  //   return () => clearTimeout(timeOutId);
  // }, []);


  // const initializeSession = () => {
  //   let tabId = sessionStorage.getItem(CHAT_SESSIONS.SESSION_ID_KEY);
  //   if (!tabId) {
  //     tabId = generateUEID();
  //     sessionStorage.setItem(CHAT_SESSIONS.SESSION_ID_KEY, tabId);
  //   }

  //   let currentState = getCurrentSessionState();

  //   if (!currentState.ids.includes(tabId)) {
  //     currentState.ids.push(tabId);
  //     currentState.count = currentState.ids.length;
  //     localStorage.setItem(
  //         CHAT_SESSIONS.SESSION_STATE_KEY,
  //         JSON.stringify(currentState)
  //     );
  //   }

  //   const handleTabClose = () => {
  //     const currentAppState = JSON.parse(
  //         localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
  //     ) || { ids: [], count: 0 };

  //     const updatedIds = currentAppState.ids.filter(
  //         (id: string) => id !== tabId
  //     );
  //     const updatedState = {
  //       ids: updatedIds,
  //       count: updatedIds.length,
  //     };

  //     localStorage.setItem(
  //         CHAT_SESSIONS.SESSION_STATE_KEY,
  //         JSON.stringify(updatedState)
  //     );
  //   };

  //   window.addEventListener("beforeunload", handleTabClose);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleTabClose);
  //   };
  // };

  // const getCurrentSessionState = () => {
  //   return (
  //       JSON.parse(
  //           localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
  //       ) || { ids: [], count: 0 }
  //   );
  // };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <UnsavedChangesHandler />
        <UnsavedChangesDialog />
        <RootComponent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
