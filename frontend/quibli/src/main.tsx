import { createRoot } from 'react-dom/client'
import 'react-loading-skeleton/dist/skeleton.css'
import './index.css'
import App from './App.tsx'
import RouterConfig from './router/index.tsx';
import { useUserStore } from '@/store/user'
import { refreshSessionWithRefreshToken } from '@/api/config'

// 持久化恢复后仅有 refresh_token，access 在内存中，需换发一次才能带 Authorization
const resumeSessionAfterHydration = () => {
  const { refreshToken } = useUserStore.getState()
  if (refreshToken) {
    void refreshSessionWithRefreshToken()
  }
}
if (useUserStore.persist.hasHydrated()) {
  resumeSessionAfterHydration()
} else {
  useUserStore.persist.onFinishHydration(resumeSessionAfterHydration)
}

async function bootstrap() {
  createRoot(document.getElementById('root')!).render(
    <RouterConfig>
      <App />
    </RouterConfig>
  )
}

void bootstrap()
