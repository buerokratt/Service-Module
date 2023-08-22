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
        queryKey: ['cs-custom-jwt-userinfo'],
        onSuccess: (data) => store.setUserInfo(data),
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
