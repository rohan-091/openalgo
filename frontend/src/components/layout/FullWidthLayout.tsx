import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

/**
 * Full-width layout for apps like Playground that need maximum screen space.
 * No container constraints, minimal chrome.
 */
export function FullWidthLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const appMode = useThemeStore((s) => s.appMode)
  const isAnalyzer = appMode === 'analyzer'
  const allowedWithoutBroker = Boolean(user?.username) && isAnalyzer

  if (!isAuthenticated && !allowedWithoutBroker) {
    return <Navigate to="/login" replace />
  }

  if (!user?.broker && !allowedWithoutBroker) {
    return <Navigate to="/broker" replace />
  }

  return (
    <SocketProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </SocketProvider>
  )
}
