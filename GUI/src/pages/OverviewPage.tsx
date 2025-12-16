import withAuthorization, { ROLES } from 'hoc/with-authorization';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, ExportServicesModal, Track } from '../components';
import ServicesTable from '../components/ServicesTable';
import { trainingModuleTraining } from '../resources/api-constants';
import { ROUTES } from '../resources/routes-constants';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

  return (
    <>
      <Track justify="between">
        <h1>{t('overview.services')}</h1>
        <Track gap={16}>
          <Button onClick={() => setIsExportModalVisible(true)}>{t('overview.exportMany')}</Button>
          <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t('overview.create')}</Button>
        </Track>
      </Track>
      <ServicesTable />
      <Track justify="between">
        <h1>{t('overview.commonServices')}</h1>
      </Track>
      <ServicesTable isCommon />
      <p>
        {t('overview.trainingModuleLink.text')}{' '}
        <a href={trainingModuleTraining()}>{t('overview.trainingModuleLink.train')}</a>.
      </p>
      <ExportServicesModal isVisible={isExportModalVisible} onClose={() => setIsExportModalVisible(false)} />
    </>
  );
};

const AuthorizedOverviewPage = withAuthorization(OverviewPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
export default AuthorizedOverviewPage;
