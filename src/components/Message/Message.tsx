import { decodeHtmlEntities } from '../../utils/html'
import styles from './Message.module.css'

type MessageProps = {
  text: string
  author?: string
  timestamp: string
  isOwn: boolean
}

function Message({ text, author, timestamp, isOwn }: MessageProps) {
  const variantClass = isOwn ? styles.own : styles.other
  const decodedText = decodeHtmlEntities(text)
  const decodedAuthor = author ? decodeHtmlEntities(author) : undefined

  return (
    <article className={[styles.message, variantClass].join(' ')}>
      <div className={styles.bubble}>
        {!isOwn && decodedAuthor && (
          <p className={styles.author}>{decodedAuthor}</p>
        )}
        <p className={styles.text}>{decodedText}</p>
        <time className={styles.timestamp}>{timestamp}</time>
      </div>
    </article>
  )
}

export default Message
