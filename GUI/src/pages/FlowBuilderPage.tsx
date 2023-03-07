import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Track } from '../components'

const FlowBuilderPage: React.FC = () => {
  return (
    <Track direction='horizontal' justify='between' align='left'>
      <Track direction='vertical'>
        <h4>Request and response elements</h4>
      </Track>
      <Track direction='vertical'>
        <h4>Ordering the service flow</h4>
      </Track>
      <Track direction='vertical'>
        <h4>Elements used in the Service</h4>
      </Track>
    </Track>
  )
}

export default FlowBuilderPage
