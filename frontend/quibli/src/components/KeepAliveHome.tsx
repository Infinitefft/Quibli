import { KeepAlive } from 'react-activation'
import Home from '@/pages/Home'

export default function KeepAliveHome() {
  return (
    <KeepAlive name="home" saveScrollPosition="screen">
      <Home />
    </KeepAlive>
  )
}
