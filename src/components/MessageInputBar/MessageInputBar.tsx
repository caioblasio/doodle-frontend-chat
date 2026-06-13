import { useState } from 'react'
import Button from '../Button/Button'
import Input from '../Input/Input'
import styles from './MessageInputBar.module.css'

function MessageInputBar() {
  const [message, setMessage] = useState('')

  return (
    <div className={styles.inputBar}>
      <div className={styles.inputBarInner}>
        <Input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <Button>Send</Button>
      </div>
    </div>
  )
}

export default MessageInputBar
