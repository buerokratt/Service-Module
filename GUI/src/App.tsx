import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/Toast/ToastProvider";
import RootComponent from "./RootComponent";
import useStore from "./store/store";
import { useQuery } from "@tanstack/react-query";
import { UserInfo } from "./types/userInfo";

const App: React.FC = () => {
  if (import.meta.env.REACT_APP_LOCAL === "true") {
    useQuery<{
      data: { custom_jwt_userinfo: UserInfo };
    }>({
      queryKey: ["userinfo", "prod"],
      onSuccess: (res: any) => {
        return useStore.getState().setUserInfo(res.data)
      },
    });
  } else {
    const { data: userInfo } = useQuery<UserInfo>({
      queryKey: [import.meta.env.REACT_APP_AUTH_PATH, "auth"],
      onSuccess: (res: { response: UserInfo }) => {
        localStorage.setItem("exp", res.response.JWTExpirationTimestamp);
        return useStore.getState().setUserInfo(res.response);
      },
    });
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <RootComponent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
