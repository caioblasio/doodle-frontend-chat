import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, sendMessage as sendMessageApi } from '../api/messages'
import { CURRENT_AUTHOR, MESSAGE_PAGE_SIZE } from '../constants/config'
import type { Message } from '../types/message'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
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
