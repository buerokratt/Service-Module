import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import { ROUTES } from './resources/routes-constants'
import OldNewServicePage from './pages/OldNewServicePage'
import './styles/main.scss'
import IntentsFollowupTraining from './pages/Training/IntentsFollowupTraining'
import ServiceFlowPage from './pages/ServiceFlowPage'
import NewServicePage from './pages/NewServicePage'
import FlowBuilderPage from './pages/FlowBuilderPage'

const RootComponent: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
        <Route path={ROUTES.FLOW_ROUTE} element={<ServiceFlowPage />} />
        <Route path={ROUTES.NEWSERVICE_ROUTE} element={<NewServicePage />} />
        <Route path={ROUTES.FOLLOWUPTRAINING_ROUTE} element={<IntentsFollowupTraining />} />
        <Route
          path={ROUTES.NEWSERVICE_ROUTE + "/old"}
          element={<OldNewServicePage />}
        />
        <Route path={ROUTES.FLOW_ROUTE + "/old"} element={<FlowBuilderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default RootComponent;
