import { useLayoutEffect, useRef } from 'react'
import Button from '../Button/Button'
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
  isLoadingMore: boolean
  hasMore: boolean
  loadMoreMessages: () => Promise<boolean>
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

function ChatArea({
  messages,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreMessages,
}: ChatAreaProps) {
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const chatItems = buildChatList(messages)

  async function handleLoadMoreClick() {
    const container = chatAreaRef.current

    if (!container || isLoadingMore || !hasMore) {
      return
    }

    pendingScrollRestoreRef.current = container.scrollHeight
    await loadMoreMessages()
  }

  useLayoutEffect(() => {
    const container = chatAreaRef.current

    if (!container) {
      return
    }

    if (pendingScrollRestoreRef.current !== null) {
      const previousScrollHeight = pendingScrollRestoreRef.current
      pendingScrollRestoreRef.current = null
      container.scrollTop += container.scrollHeight - previousScrollHeight
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages])

  return (
    <div
      ref={chatAreaRef}
      className={styles.chatArea}
      aria-busy={isLoadingMore}
    >
      <div className={styles.chatAreaInner}>
        {isLoading ? (
          <p className={styles.loading}>Loading messages...</p>
        ) : (
          <div className={styles.messageList}>
            {hasMore && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  className={styles.loadMoreButton}
                  onClick={handleLoadMoreClick}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load older messages'}
                </Button>
              </div>
            )}
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
