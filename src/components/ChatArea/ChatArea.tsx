import { useEffect, useRef } from 'react'
import DateSeparator from '../DateSeparator/DateSeparator'
import Message from '../Message/Message'
import { CURRENT_AUTHOR } from '../../constants/config'
import type { Message as MessageType } from '../../types/message'
import {
  formatDateSeparator,
  formatMessageTime,
  getDayKey,
} from '../../utils/dates'
import styles from './ChatArea.module.css'

type ChatListItem =
  | { type: 'separator'; id: string; date: string }
  | { type: 'message'; message: MessageType }

type ChatAreaProps = {
  messages: MessageType[]
  isLoading: boolean
}

function buildChatList(messages: MessageType[]): ChatListItem[] {
  const items: ChatListItem[] = []
  let previousDayKey = ''

  for (const message of messages) {
    const dayKey = getDayKey(message.createdAt)

    if (dayKey !== previousDayKey) {
      items.push({
        type: 'separator',
        id: `separator-${dayKey}`,
        date: message.createdAt,
      })
      previousDayKey = dayKey
    }

    items.push({ type: 'message', message })
  }

  return items
}

function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const chatItems = buildChatList(messages)

  useEffect(() => {
    const container = chatAreaRef.current

    if (!container || isLoading) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [isLoading, messages])

  return (
    <div ref={chatAreaRef} className={styles.chatArea}>
      <div className={styles.chatAreaInner}>
        {isLoading ? (
          <p className={styles.loading}>Loading messages...</p>
        ) : (
          <div className={styles.messageList}>
            {chatItems.map((item) => {
              if (item.type === 'separator') {
                return (
                  <DateSeparator
                    key={item.id}
                    label={formatDateSeparator(item.date)}
                  />
                )
              }

              const { message } = item
              const isOwn = message.author === CURRENT_AUTHOR

              return (
                <Message
                  key={message._id}
                  text={message.message}
                  author={isOwn ? undefined : message.author}
                  timestamp={formatMessageTime(message.createdAt)}
                  isOwn={isOwn}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatArea
