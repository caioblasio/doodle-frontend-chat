import { useId, useRef, useState, type FormEvent } from 'react'
import Button from '../Button/Button'
import Input from '../Input/Input'
import Spinner from '../Spinner/Spinner'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const messageInputId = useId()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sent = await onSend(message)

    if (sent) {
      setMessage('')
      inputRef.current?.focus()
    }
  }

  const isSendDisabled = isSending || !message.trim()

  return (
    <form className={styles.inputBar} onSubmit={handleSubmit} aria-label="Send a message">
      <div className={styles.inputBarInner}>
        <label htmlFor={messageInputId} className="visuallyHidden">
          Message
        </label>
        <Input
          ref={inputRef}
          id={messageInputId}
          type="text"
          placeholder="Message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            onInputChange?.()
          }}
          disabled={isSending}
          autoComplete="off"
          enterKeyHint="send"
        />
        <Button
          type="submit"
          disabled={isSendDisabled}
          className={styles.sendButton}
          aria-label="Send message"
        >
          {isSending ? (
            <Spinner size="small" variant="light" label="Sending message" />
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </form>
  )
}

export default MessageInputBar
