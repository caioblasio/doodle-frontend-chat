import { useCallback, useEffect, useRef, useState } from 'react'
import { getRequestErrorMessage } from '../api/errors'
import { fetchMessages, sendMessage as sendMessageApi } from '../api/messages'
import {
  CURRENT_AUTHOR,
  MESSAGE_PAGE_SIZE,
  POLL_INTERVAL_MS,
} from '../constants/config'
import type { Message } from '../types/message'

// Merges API results into the message list without duplicates.
// Use 'prepend' when loading older messages; use 'append' when polling for new ones.
function mergeUniqueMessages(
  previous: Message[],
  incoming: Message[],
  position: 'prepend' | 'append',
): Message[] {
  const existingIds = new Set(previous.map((message) => message._id))
  const newMessages = incoming.filter(
    (message) => !existingIds.has(message._id),
  )

  if (newMessages.length === 0) {
    return previous
  }

  return position === 'prepend'
    ? [...newMessages, ...previous]
    : [...previous, ...newMessages]
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const newestCreatedAtRef = useRef<string | null>(null)
  const oldestMessageRef = useRef<Message | null>(null)
  const isLoadingMoreRef = useRef(isLoadingMore)
  const hasMoreRef = useRef(hasMore)

  isLoadingMoreRef.current = isLoadingMore
  hasMoreRef.current = hasMore

  useEffect(() => {
    if (messages.length === 0) {
      newestCreatedAtRef.current = null
      oldestMessageRef.current = null
      return
    }

    newestCreatedAtRef.current = messages[messages.length - 1].createdAt
    oldestMessageRef.current = messages[0]
  }, [messages])

  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchMessages({
        limit: MESSAGE_PAGE_SIZE,
        before: new Date().toISOString(),
      })

      setMessages(data)
      setHasMore(data.length === MESSAGE_PAGE_SIZE)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setLoadError(
        getRequestErrorMessage(
          error,
          'Failed to load messages. Please try again.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInitialMessages()
  }, [loadInitialMessages])

  useEffect(() => {
    if (isLoading || loadError) {
      return
    }

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function pollForNewMessages() {
      if (cancelled || document.hidden) {
        return
      }

      const after = newestCreatedAtRef.current

      if (!after) {
        return
      }

      try {
        const data = await fetchMessages({
          after,
          limit: MESSAGE_PAGE_SIZE,
        })

        if (cancelled || data.length === 0) {
          return
        }

        setMessages((previous) => mergeUniqueMessages(previous, data, 'append'))
      } catch (error) {
        console.error('Failed to poll for messages:', error)
      }
    }

    function startPolling() {
      if (intervalId !== null) {
        return
      }

      intervalId = setInterval(() => {
        void pollForNewMessages()
      }, POLL_INTERVAL_MS)
    }

    function stopPolling() {
      if (intervalId === null) {
        return
      }

      clearInterval(intervalId)
      intervalId = null
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopPolling()
        return
      }

      void pollForNewMessages()
      startPolling()
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isLoading, loadError])

  const loadMoreMessages = useCallback(async (): Promise<boolean> => {
    if (
      isLoadingMoreRef.current ||
      !hasMoreRef.current ||
      oldestMessageRef.current === null
    ) {
      return false
    }

    const oldestMessage = oldestMessageRef.current
    setIsLoadingMore(true)

    try {
      const data = await fetchMessages({
        before: oldestMessage.createdAt,
        limit: MESSAGE_PAGE_SIZE,
      })

      setHasMore(data.length === MESSAGE_PAGE_SIZE)

      setMessages((previous) => mergeUniqueMessages(previous, data, 'prepend'))

      return true
    } catch (error) {
      console.error('Failed to load older messages:', error)
      return false
    } finally {
      setIsLoadingMore(false)
    }
  }, [])

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    const trimmed = text.trim()

    if (!trimmed || isSending) {
      return false
    }

    setIsSending(true)
    setSendError(null)

    try {
      const created = await sendMessageApi(trimmed, CURRENT_AUTHOR)
      setMessages((previous) => [...previous, created])
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      setSendError(
        getRequestErrorMessage(
          error,
          'Failed to send message. Please try again.',
        ),
      )
      return false
    } finally {
      setIsSending(false)
    }
  }, [isSending])

  const clearSendError = useCallback(() => {
    setSendError(null)
  }, [])

  const clearLoadError = useCallback(() => {
    setLoadError(null)
  }, [])

  return {
    messages,
    isLoading,
    loadError,
    retryLoad: loadInitialMessages,
    clearLoadError,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
    isSending,
    sendError,
    clearSendError,
    sendMessage,
  }
}
