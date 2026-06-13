import { useEffect, useLayoutEffect, useRef } from 'react'
import DateSeparator from '../DateSeparator/DateSeparator'
import Message from '../Message/Message'
import Spinner from '../Spinner/Spinner'
import { CURRENT_AUTHOR } from '../../constants/config'
import type { Message as MessageType } from '../../types/message'
import {
  formatDateSeparator,
  formatMessageTime,
  getDayKey,
} from '../../utils/dates'
import styles from './ChatArea.module.css'

const SCROLL_NEAR_BOTTOM_THRESHOLD = 100

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isNearBottom(container: HTMLDivElement) {
  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    SCROLL_NEAR_BOTTOM_THRESHOLD
  )
}

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
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null)
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const isNearBottomRef = useRef(true)
  const hasScrolledInitiallyRef = useRef(false)
  const isLoadingMoreRef = useRef(isLoadingMore)
  const chatItems = buildChatList(messages)

  isLoadingMoreRef.current = isLoadingMore

  useEffect(() => {
    const container = chatAreaRef.current

    if (!container || isLoading) {
      return
    }

    const chatContainer = container

    function handleScroll() {
      isNearBottomRef.current = isNearBottom(chatContainer)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [isLoading])

  useEffect(() => {
    const container = chatAreaRef.current
    const sentinel = loadMoreSentinelRef.current

    if (!container || !sentinel || isLoading || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (!entry?.isIntersecting || isLoadingMoreRef.current) {
          return
        }

        pendingScrollRestoreRef.current = container.scrollHeight
        void loadMoreMessages()
      },
      {
        root: container,
        threshold: 0,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, loadMoreMessages])

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

    if (!hasScrolledInitiallyRef.current) {
      container.scrollTop = container.scrollHeight
      hasScrolledInitiallyRef.current = true
      isNearBottomRef.current = true
      return
    }

    if (isNearBottomRef.current && !prefersReducedMotion()) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={chatAreaRef}
      className={styles.chatArea}
      role="region"
      aria-label="Chat messages"
    >
      <div className={styles.chatAreaInner}>
        {isLoading ? (
          <div className={styles.loading} role="status" aria-busy="true">
            <Spinner label="Loading messages" />
          </div>
        ) : messages.length === 0 ? (
          <p className={styles.empty} role="status">
            No messages yet. Say hello!
          </p>
        ) : (
          <div
            className={styles.messageList}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-busy={isLoadingMore}
          >
            {hasMore && (
              <div
                ref={loadMoreSentinelRef}
                className={styles.loadMoreSentinel}
                aria-hidden
              />
            )}
            {isLoadingMore && (
              <div className={styles.loadingMore}>
                <Spinner
                  size="small"
                  label="Loading older messages"
                />
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
                  dateTime={message.createdAt}
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
