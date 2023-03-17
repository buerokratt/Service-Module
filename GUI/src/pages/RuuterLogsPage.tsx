import React from 'react'
import { useTranslation } from 'react-i18next'
import { Track } from '../components'

const RuuterLogsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Track direction='vertical'>
      <h1>{t('menu.ruuterlogs')}</h1>
    </Track>
  )
}

export default RuuterLogsPage
