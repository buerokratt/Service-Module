import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTES } from '../resources/routes-constants';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>Oops 404!</h1>
      <Link to={ROUTES.OVERVIEW_ROUTE}>{t('global.backhome')}</Link>
    </>
  );
};

export default NotFoundPage;
