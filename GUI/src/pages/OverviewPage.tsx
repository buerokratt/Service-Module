import withAuthorization, { ROLES } from 'hoc/with-authorization';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, Track } from '../components';
import ServicesTable from '../components/ServicesTable';
import { trainingModuleTraining } from '../resources/api-constants';
import { ROUTES } from '../resources/routes-constants';
import { importServices } from 'utils/service-import';

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <>
      <Track justify="between">
        <h1>{t('overview.services')}</h1>
        <Track gap={16}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={importServices}
            accept=".json"
            style={{ display: 'none' }}
            multiple
          />
          <Button onClick={triggerFileInput}>{t('overview.importMany')}</Button>
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
    </>
  );
};

const AuthorizedOverviewPage = withAuthorization(OverviewPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_SERVICE_MANAGER]);
export default AuthorizedOverviewPage;
