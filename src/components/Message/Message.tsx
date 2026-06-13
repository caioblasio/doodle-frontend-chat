import styles from './Message.module.css'

type MessageProps = {
  text: string
  author?: string
  timestamp: string
  isOwn: boolean
}

function Message({ text, author, timestamp, isOwn }: MessageProps) {
  const variantClass = isOwn ? styles.own : styles.other

  return (
    <article className={[styles.message, variantClass].join(' ')}>
      <div className={styles.bubble}>
        {!isOwn && author && <p className={styles.author}>{author}</p>}
        <p className={styles.text}>{text}</p>
        <time className={styles.timestamp}>{timestamp}</time>
      </div>
    </article>
  )
}

export default Message
