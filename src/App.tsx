import ChatArea from './components/ChatArea/ChatArea'
import MessageInputBar from './components/MessageInputBar/MessageInputBar'
import Toast from './components/Toast/Toast'
import toastContainerStyles from './components/Toast/ToastContainer.module.css'
import { useMessages } from './hooks/useMessages'
import styles from './App.module.css'

function App() {
  const {
    messages,
    isLoading,
    loadError,
    retryLoad,
    clearLoadError,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
    isSending,
    sendError,
    clearSendError,
    sendMessage,
  } = useMessages()

  const hasToasts = loadError !== null || sendError !== null

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMoreMessages={loadMoreMessages}
        />
      </main>
      {hasToasts && (
        <div className={toastContainerStyles.toastContainer}>
          {loadError && (
            <Toast
              message={loadError}
              actionLabel="Try again"
              onAction={retryLoad}
              onDismiss={clearLoadError}
            />
          )}
          {sendError && (
            <Toast message={sendError} onDismiss={clearSendError} />
          )}
        </div>
      )}
      <MessageInputBar
        onSend={sendMessage}
        isSending={isSending}
        onInputChange={clearSendError}
      />
    </div>
  )
}

export default App
