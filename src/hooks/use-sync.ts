import { useCallback, useRef, useEffect } from 'react'
import type { FeedbackItem, SyncConfig, SyncPayload } from '../types'
import { buildSyncPayload, buildBatchSyncPayload } from '../utils/sync-payload'

const MAX_RETRIES = 2
const BASE_DELAY_MS = 1000
const JITTER_FACTOR = 0.2
const DEBOUNCE_MS = 300
const BATCH_FLUSH_MS = 5000

/** Exponential backoff with jitter */
function jitteredDelay(base: number, attempt: number): number {
  const delay = base * Math.pow(2, attempt)
  const jitter = delay * JITTER_FACTOR * (Math.random() * 2 - 1)
  return Math.max(0, delay + jitter)
}

export interface UseSyncReturn {
  syncCreated: (item: FeedbackItem) => void
  syncDeleted: (feedbackId: string) => void
  syncUpdated: (feedbackId: string, content: string) => void
  queueForSync: (item: FeedbackItem) => void
  flushSync: () => void
}

export function useSync(config: SyncConfig): UseSyncReturn {
  const {
    syncUrl,
    syncHeaders,
    syncMode = 'each',
    syncDelete = false,
    syncUpdate = false,
    onSyncSuccess,
    onSyncError,
  } = config

  // Refs to avoid stale closures
  const urlRef = useRef(syncUrl)
  const headersRef = useRef(syncHeaders)
  const onSuccessRef = useRef(onSyncSuccess)
  const onErrorRef = useRef(onSyncError)
  urlRef.current = syncUrl
  headersRef.current = syncHeaders
  onSuccessRef.current = onSyncSuccess
  onErrorRef.current = onSyncError

  // Batch queue + timers
  const queueRef = useRef<FeedbackItem[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(batchTimerRef.current)
      clearTimeout(debounceTimerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  /** POST payload with retry (exponential backoff + jitter) */
  const postWithRetry = useCallback(async (payload: SyncPayload) => {
    const url = urlRef.current
    if (!url) return

    const controller = new AbortController()
    abortRef.current = controller

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, jitteredDelay(BASE_DELAY_MS, attempt - 1)))
      }
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headersRef.current,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        if (res.ok) {
          onSuccessRef.current?.(payload)
          return
        }
        if (attempt === MAX_RETRIES) {
          onErrorRef.current?.(new Error(`Sync failed: ${res.status}`), payload)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        if (attempt === MAX_RETRIES) {
          onErrorRef.current?.(err as Error, payload)
        }
      }
    }
  }, [])

  /** Debounced POST for each mode */
  const debouncedPost = useCallback((payload: SyncPayload) => {
    clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      postWithRetry(payload)
    }, DEBOUNCE_MS)
  }, [postWithRetry])

  // --- Each mode methods ---

  const syncCreated = useCallback((item: FeedbackItem) => {
    if (!urlRef.current || syncMode !== 'each') return
    debouncedPost(buildSyncPayload('feedback.created', item))
  }, [syncMode, debouncedPost])

  const syncDeleted = useCallback((feedbackId: string) => {
    if (!urlRef.current || syncMode !== 'each' || !syncDelete) return
    debouncedPost(buildSyncPayload('feedback.deleted', undefined, { feedbackId }))
  }, [syncMode, syncDelete, debouncedPost])

  const syncUpdated = useCallback((feedbackId: string, content: string) => {
    if (!urlRef.current || syncMode !== 'each' || !syncUpdate) return
    debouncedPost(buildSyncPayload('feedback.updated', undefined, { feedbackId, updatedContent: content }))
  }, [syncMode, syncUpdate, debouncedPost])

  // --- Batch mode methods ---

  const flushSync = useCallback(() => {
    if (!urlRef.current || queueRef.current.length === 0) return
    const items = [...queueRef.current]
    queueRef.current = []
    clearTimeout(batchTimerRef.current)
    postWithRetry(buildBatchSyncPayload(items))
  }, [postWithRetry])

  const queueForSync = useCallback((item: FeedbackItem) => {
    if (!urlRef.current || syncMode !== 'batch') return
    queueRef.current.push(item)
    clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(flushSync, BATCH_FLUSH_MS)
  }, [syncMode, flushSync])

  return { syncCreated, syncDeleted, syncUpdated, queueForSync, flushSync }
}
