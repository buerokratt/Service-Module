import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import { ROUTES } from './resources/routes-constants'
import OldNewServicePage from './pages/OldNewServicePage'
import IntentsFollowupTraining from './pages/Training/IntentsFollowupTraining'
import NewServicePage from './pages/NewServicePage'
import ServiceFlowPage from './pages/ServiceFlowPage'
import './styles/main.scss'

const RootComponent: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.NEWSERVICE_ROUTE} element={<NewServicePage />} />
      <Route path={ROUTES.FLOW_ROUTE} element={<ServiceFlowPage />} />
      <Route element={<Layout />}>
        <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
        <Route path={ROUTES.NEWSERVICE_ROUTE + "/old"} element={<OldNewServicePage />} />
        <Route path={ROUTES.FOLLOWUPTRAINING_ROUTE} element={<IntentsFollowupTraining />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route >
    </Routes >
  );
};

export default RootComponent;
