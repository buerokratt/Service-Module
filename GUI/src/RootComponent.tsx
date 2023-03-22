import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components";
import NewServicePage from "./pages/NewServicePage";
import OldNewServicePage from "./pages/OldNewServicePage";
import NotFoundPage from "./pages/NotFoundPage";
import OverviewPage from "./pages/OverviewPage";
import { ROUTES } from "./resources/routes-constants";
import "./styles/main.scss";

const RootComponent: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.NEWSERVICE_ROUTE} element={<NewServicePage />} />
      <Route element={<Layout />}>
        <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
        <Route
          path={ROUTES.NEWSERVICE_ROUTE + "/old"}
          element={<OldNewServicePage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default RootComponent;
