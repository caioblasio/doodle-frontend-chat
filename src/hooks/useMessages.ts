import { useEffect, useState } from 'react'
import { fetchMessages } from '../api/messages'
import { MESSAGE_PAGE_SIZE } from '../constants/config'
import type { Message } from '../types/message'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  return { messages, isLoading }
}
