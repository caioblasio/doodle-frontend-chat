export function formatMessageTime(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date

  return value.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDateSeparator(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date

  return value.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getDayKey(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date

  return [
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  ].join('-')
}
