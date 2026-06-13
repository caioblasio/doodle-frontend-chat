import styles from './MessageInputBar.module.css'

function MessageInputBar() {
  return (
    <div className={styles.inputBar}>
      <input
        type="text"
        className={styles.input}
        placeholder="Message"
      />
      <button type="button" className={styles.sendButton}>
        Send
      </button>
    </div>
  )
}

export default MessageInputBar
