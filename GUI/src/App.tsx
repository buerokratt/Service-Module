import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast/ToastContext'
import RootComponent from './RootComponent'
import { store as reducer} from './store/reducers/store'
import useUserInfoStore from "./store/store";
import {useQuery} from "@tanstack/react-query";
import {UserInfo} from "./types/userInfo";

const App: React.FC = () => {
    const store = useUserInfoStore();
    const { data: userInfo } = useQuery<UserInfo>({
        queryKey: [import.meta.env.REACT_APP_AUTH_PATH, 'auth'],
        onSuccess: (data: { data: { custom_jwt_userinfo: UserInfo } }) =>
            store.setUserInfo(data.data.custom_jwt_userinfo),
    });

  return (
    <Provider store={reducer}>
      <BrowserRouter basename={'/'}>
        <ToastProvider>
          <RootComponent />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default App
