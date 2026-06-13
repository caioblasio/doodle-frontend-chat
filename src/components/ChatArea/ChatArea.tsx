import Message from '../Message/Message'
import styles from './ChatArea.module.css'

const SAMPLE_MESSAGES = [
  {
    id: '1',
    text: 'Hey, are we still on for the meeting this afternoon?',
    author: 'John Smith',
    timestamp: '9:15 AM',
    isOwn: false,
  },
  {
    id: '2',
    text: 'Yes! I will be there around 2pm.',
    author: undefined,
    timestamp: '9:18 AM',
    isOwn: true,
  },
  {
    id: '3',
    text: 'Great, I will bring the notes from last week.',
    author: 'Jane Doe',
    timestamp: '9:22 AM',
    isOwn: false,
  },
  {
    id: '4',
    text: 'Perfect, see you then.',
    author: undefined,
    timestamp: '9:24 AM',
    isOwn: true,
  },
]

function ChatArea() {
  return (
    <div className={styles.chatArea}>
      <div className={styles.chatAreaInner}>
        <div className={styles.messageList}>
          {SAMPLE_MESSAGES.map((message) => (
            <Message
              key={message.id}
              text={message.text}
              author={message.author}
              timestamp={message.timestamp}
              isOwn={message.isOwn}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatArea
