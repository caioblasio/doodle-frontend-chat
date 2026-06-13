import { useState, type FormEvent } from 'react'
import Button from '../Button/Button'
import Input from '../Input/Input'
import styles from './MessageInputBar.module.css'

type MessageInputBarProps = {
  onSend: (message: string) => Promise<boolean>
  isSending: boolean
  onInputChange?: () => void
}

function MessageInputBar({
  onSend,
  isSending,
  onInputChange,
}: MessageInputBarProps) {
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sent = await onSend(message)

    if (sent) {
      setMessage('')
    }
  }

  const isSendDisabled = isSending || !message.trim()

  return (
    <form className={styles.inputBar} onSubmit={handleSubmit}>
      <div className={styles.inputBarInner}>
        <Input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            onInputChange?.()
          }}
          disabled={isSending}
        />
        <Button type="submit" disabled={isSendDisabled}>
          Send
        </Button>
      </div>
    </form>
  )
}

export default MessageInputBar
