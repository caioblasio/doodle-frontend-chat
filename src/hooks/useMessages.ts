import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMessages, sendMessage as sendMessageApi } from '../api/messages'
import {
  CURRENT_AUTHOR,
  MESSAGE_PAGE_SIZE,
  POLL_INTERVAL_MS,
} from '../constants/config'
import type { Message } from '../types/message'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const newestCreatedAtRef = useRef<string | null>(null)
  useEffect(() => {
    let cancelled = false

    async function loadInitialMessages() {
      try {
        const data = await fetchMessages({
          limit: MESSAGE_PAGE_SIZE,
          before: new Date().toISOString(),
        })

        if (!cancelled) {
          setMessages(data)
          setHasMore(data.length === MESSAGE_PAGE_SIZE)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInitialMessages()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0) {
      newestCreatedAtRef.current = null
      return
    }

    newestCreatedAtRef.current = messages[messages.length - 1].createdAt
  }, [messages])

  useEffect(() => {
    if (isLoading) {
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

        setMessages((previous) => {
          const existingIds = new Set(previous.map((message) => message._id))
          const newMessages = data.filter(
            (message) => !existingIds.has(message._id),
          )

          if (newMessages.length === 0) {
            return previous
          }

          return [...previous, ...newMessages]
        })
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
  }, [isLoading])

  const loadMoreMessages = useCallback(async (): Promise<boolean> => {
    if (isLoadingMore || !hasMore || messages.length === 0) {
      return false
    }

    const oldestMessage = messages[0]
    setIsLoadingMore(true)

    try {
      const data = await fetchMessages({
        before: oldestMessage.createdAt,
        limit: MESSAGE_PAGE_SIZE,
      })

      setHasMore(data.length === MESSAGE_PAGE_SIZE)

      setMessages((previous) => {
        const existingIds = new Set(previous.map((message) => message._id))
        const newMessages = data.filter(
          (message) => !existingIds.has(message._id),
        )

        return [...newMessages, ...previous]
      })

      return true
    } catch (error) {
      console.error('Failed to load older messages:', error)
      return false
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore, messages])

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    const trimmed = text.trim()

    if (!trimmed || isSending) {
      return false
    }

    setIsSending(true)

    try {
      const created = await sendMessageApi(trimmed, CURRENT_AUTHOR)
      setMessages((previous) => [...previous, created])
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    } finally {
      setIsSending(false)
    }
  }, [isSending])

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
    isSending,
    sendMessage,
  }
}
