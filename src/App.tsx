import ChatArea from './components/ChatArea/ChatArea'
import MessageInputBar from './components/MessageInputBar/MessageInputBar'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <ChatArea />
      </main>
      <MessageInputBar />
    </div>
  )
}

export default App
