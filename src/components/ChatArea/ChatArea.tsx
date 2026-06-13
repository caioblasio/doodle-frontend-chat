import DateSeparator from '../DateSeparator/DateSeparator'
import Message from '../Message/Message'
import {
  formatDateSeparator,
  formatMessageTime,
  getDayKey,
} from '../../utils/dates'
import styles from './ChatArea.module.css'

type SampleMessage = {
  id: string
  text: string
  author?: string
  createdAt: string
  isOwn: boolean
}

const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: '1',
    text: 'Hey, are we still on for the meeting this afternoon?',
    author: 'John Smith',
    createdAt: '2018-03-09T09:15:00Z',
    isOwn: false,
  },
  {
    id: '2',
    text: 'Yes! I will be there around 2pm.',
    createdAt: '2018-03-09T09:18:00Z',
    isOwn: true,
  },
  {
    id: '3',
    text: 'Great, I will bring the notes from last week.',
    author: 'Jane Doe',
    createdAt: '2018-03-10T09:22:00Z',
    isOwn: false,
  },
  {
    id: '4',
    text: 'Perfect, see you then.',
    createdAt: '2018-03-10T09:24:00Z',
    isOwn: true,
  },
]

type ChatListItem =
  | { type: 'separator'; id: string; date: string }
  | { type: 'message'; message: SampleMessage }

function buildChatList(messages: SampleMessage[]): ChatListItem[] {
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

function ChatArea() {
  const chatItems = buildChatList(SAMPLE_MESSAGES)

  return (
    <div className={styles.chatArea}>
      <div className={styles.chatAreaInner}>
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

            return (
              <Message
                key={message.id}
                text={message.text}
                author={message.author}
                timestamp={formatMessageTime(message.createdAt)}
                isOwn={message.isOwn}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ChatArea
