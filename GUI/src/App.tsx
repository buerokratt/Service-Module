import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast/ToastContext'
import RootComponent from './RootComponent'
import { store } from './store/reducers/store'

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename={'/'}>
        <ToastProvider>
          <RootComponent />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default App
