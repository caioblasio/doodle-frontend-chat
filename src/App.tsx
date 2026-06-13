import ChatArea from './components/ChatArea/ChatArea'
import MessageInputBar from './components/MessageInputBar/MessageInputBar'
import { useMessages } from './hooks/useMessages'
import styles from './App.module.css'

function App() {
  const { messages, isLoading, isSending, sendMessage } = useMessages()

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <ChatArea messages={messages} isLoading={isLoading} />
      </main>
      <MessageInputBar onSend={sendMessage} isSending={isSending} />
    </div>
  )
}

export default App
