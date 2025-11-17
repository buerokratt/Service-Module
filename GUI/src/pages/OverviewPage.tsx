import withAuthorization, { ROLES } from 'hoc/with-authorization';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, Track } from '../components';
import ServicesTable from '../components/ServicesTable';
import { trainingModuleTraining } from '../resources/api-constants';
import { ROUTES } from '../resources/routes-constants';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Track justify="between">
        <h1>{t('overview.services')}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t('overview.create')}</Button>
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
    </>
  );
};

export default withAuthorization(OverviewPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
