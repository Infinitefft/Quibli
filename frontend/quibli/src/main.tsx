import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import RouterConfig from './router/index.tsx';
import { setupPostMock } from '../mock/postmock'

if (import.meta.env.VITE_USE_POST_MOCK === 'true') {
  setupPostMock()
}

createRoot(document.getElementById('root')!).render(
  <RouterConfig>
    <App />
  </RouterConfig>
)
