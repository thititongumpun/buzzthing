import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-lg">
      <div className="mb-3 text-sm">
        {offlineReady ? (
          <span>App ready to work offline.</span>
        ) : (
          <span>New content available. Reload to update?</span>
        )}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Reload
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={close}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
