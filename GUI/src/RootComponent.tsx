import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import { Layout } from './components'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import FaultyServicesPage from './pages/FaultyServicesPage'
import { ROUTES } from './resources/routes-constants'
import IntentsFollowupTraining from './pages/Training/IntentsFollowupTraining'
import NewServicePage from './pages/NewServicePage'
import ServiceFlowPage from './pages/ServiceFlowPage'
import ServiceSettingPage from './pages/ServiceSettingPage'
import './styles/main.scss'

const RootComponent: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTES.OVERVIEW_ROUTE} />} />
      <Route path={ROUTES.NEWSERVICE_ROUTE} element={<NewServicePage />} />
      <Route path={ROUTES.NEWSERVICE_ROUTE_WITH_INTENT_NAME} element={<NewServicePage />} />
      <Route path={ROUTES.FLOW_ROUTE} element={<ServiceFlowPage />} />
      <Route element={<Layout />}>
        <Route path={"/service"} element={<Navigate to="/services/overview" />} />
        <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
        <Route path={ROUTES.FOLLOWUPTRAINING_ROUTE} element={<IntentsFollowupTraining />} />
        <Route path={ROUTES.FAULTY_SERVICES_ROUTE} element={<FaultyServicesPage />} />
        <Route path={ROUTES.SERVICE_SETTINGS} element={<ServiceSettingPage />} />
        <Route path={ROUTES.FAULTY_SERVICES_ROUTE} element={<FaultyServicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default RootComponent;
