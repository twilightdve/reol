export const getInitialFromName = (name: string): string => {
  if (!name) return '?'
  
  // 最初の文字を取得（絵文字や特殊文字にも対応）
  const firstChar = Array.from(name)[0]
  return firstChar ? firstChar.toUpperCase() : '?'
}

// 色をユーザー名から生成するヘルパー
export const getAvatarColorFromUsername = (username: string): string => {
  if (!username) return 'bg-purple-500'
  
  const colors = [
    'bg-purple-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ]
  
  // ユーザー名のハッシュ値から色を選択
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}