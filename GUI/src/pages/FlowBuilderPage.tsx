import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { Track } from '../components'
import FlowCanvas, { StepTypes } from '../components/FlowCanvas'

const FlowBuilderPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Track direction='horizontal' justify='between' align='left'>
        <Track direction='vertical'>
          <h4>Request and response elements</h4>
        </Track>
        <Track direction='vertical'>
          <h4>Ordering the service flow</h4>
          <FlowCanvas />
        </Track>
        <Track direction='vertical'>
          <h4>Elements used in the Service</h4>
          <StepTypes />
        </Track>
      </Track>
    </DndProvider>

  )
}

export default FlowBuilderPage
