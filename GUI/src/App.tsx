import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/Toast/ToastProvider";
import RootComponent from "./RootComponent";
import useStore from "./store/store";
import { useQuery } from "@tanstack/react-query";
import { UserInfo } from "./types/userInfo";

const App: React.FC = () => {
  useQuery<{
    data: { custom_jwt_userinfo: UserInfo };
  }>({
    queryKey: ["userinfo", "prod"],
    onSuccess: (res: any) => {
      return useStore.getState().setUserInfo(res.data)
    },
    enabled: import.meta.env.REACT_APP_LOCAL === "true",
  });
  
  useQuery({
    queryKey: [import.meta.env.REACT_APP_AUTH_PATH, "auth"],
    onSuccess: (res: { response: UserInfo }) => {
      localStorage.setItem("exp", res.response.JWTExpirationTimestamp);
      return useStore.getState().setUserInfo(res.response);
    },
    enabled: import.meta.env.REACT_APP_LOCAL !== "true",
  });

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <RootComponent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
