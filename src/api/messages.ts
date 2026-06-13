import { AUTH_TOKEN } from '../constants/config'
import type { Message } from '../types/message'

type FetchMessagesParams = {
  limit?: number
  before?: string
}

export async function fetchMessages(
  params: FetchMessagesParams = {},
): Promise<Message[]> {
  const searchParams = new URLSearchParams()

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.before) {
    searchParams.set('before', params.before)
  }

  const query = searchParams.toString()
  const url = `/api/v1/messages${query ? `?${query}` : ''}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`)
  }

  return response.json()
}

export async function sendMessage(
  message: string,
  author: string,
): Promise<Message> {
  const response = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, author }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`)
  }

  return response.json()
}
