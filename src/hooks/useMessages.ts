import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, sendMessage as sendMessageApi } from '../api/messages'
import { CURRENT_AUTHOR, MESSAGE_PAGE_SIZE } from '../constants/config'
import type { Message } from '../types/message'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadInitialMessages() {
      try {
        const data = await fetchMessages({ limit: MESSAGE_PAGE_SIZE })

        if (!cancelled) {
          setMessages([...data].reverse())
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

  return { messages, isLoading, isSending, sendMessage }
}
