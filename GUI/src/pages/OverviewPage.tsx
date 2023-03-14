import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Track } from '../components';
import { dummyDataApi } from '../resources/api-constants';

const OverviewPage: React.FC = () => {
  const [dummyData, setDummyData] = useState('')

  const { t } = useTranslation()

  useEffect(() => {
    axios.get(dummyDataApi())
      .then((res) => setDummyData(JSON.stringify(res.data)))
      .catch((error) => setDummyData(error.message.toString()));
  }, [])

  return (
    <Track direction='vertical'>
      <h1>{t('menu.overview')}</h1>
      <span>{JSON.stringify(dummyData, null, 2)}</span>
    </Track>
  )
}

export default OverviewPage;
