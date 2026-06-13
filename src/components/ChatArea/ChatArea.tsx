import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
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

function isNearBottom(container: HTMLDivElement) {
  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    SCROLL_NEAR_BOTTOM_THRESHOLD
  )
}

type ChatListItem =
  | { type: 'separator'; id: string; label: string }
  | {
      type: 'message'
      id: string
      text: string
      author?: string
      timestamp: string
      dateTime: string
      isOwn: boolean
    }

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
        label: formatDateSeparator(message.createdAt),
      })
      previousDayKey = dayKey
    }

    const isOwn = message.author === CURRENT_AUTHOR
    const timestamp = formatMessageTime(message.createdAt)
    const author = isOwn ? undefined : message.author

    items.push({
      type: 'message',
      id: message._id,
      text: message.message,
      author,
      timestamp,
      dateTime: message.createdAt,
      isOwn,
    })
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
  const previousMessagesRef = useRef<MessageType[]>([])
  const prefersReducedMotionRef = useRef(false)
  const scrollFrameRef = useRef<number | null>(null)
  const chatItems = useMemo(() => buildChatList(messages), [messages])

  isLoadingMoreRef.current = isLoadingMore

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = mediaQuery.matches

    function handleChange(event: MediaQueryListEvent) {
      prefersReducedMotionRef.current = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const container = chatAreaRef.current

    if (!container || isLoading) {
      return
    }

    const chatContainer = container

    function updateNearBottom() {
      isNearBottomRef.current = isNearBottom(chatContainer)
      scrollFrameRef.current = null
    }

    function handleScroll() {
      if (scrollFrameRef.current !== null) {
        return
      }

      scrollFrameRef.current = window.requestAnimationFrame(updateNearBottom)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    updateNearBottom()

    return () => {
      container.removeEventListener('scroll', handleScroll)

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
      }
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

    const previousMessages = previousMessagesRef.current
    previousMessagesRef.current = messages

    if (pendingScrollRestoreRef.current !== null) {
      const previousScrollHeight = pendingScrollRestoreRef.current
      pendingScrollRestoreRef.current = null
      container.scrollTop += container.scrollHeight - previousScrollHeight
      return
    }

    const prependedOlderMessages =
      messages.length > previousMessages.length &&
      messages[0]?._id !== previousMessages[0]?._id &&
      messages[messages.length - 1]?._id ===
        previousMessages[previousMessages.length - 1]?._id

    if (prependedOlderMessages) {
      return
    }

    if (!hasScrolledInitiallyRef.current) {
      container.scrollTop = container.scrollHeight
      hasScrolledInitiallyRef.current = true
      isNearBottomRef.current = true
      return
    }

    if (isNearBottomRef.current && !prefersReducedMotionRef.current) {
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
                    label={item.label}
                  />
                )
              }

              return (
                <Message
                  key={item.id}
                  text={item.text}
                  author={item.author}
                  timestamp={item.timestamp}
                  dateTime={item.dateTime}
                  isOwn={item.isOwn}
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
