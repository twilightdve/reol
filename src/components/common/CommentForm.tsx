import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { createComment, getUserLatestComment, deleteComment } from '../../services/commentService'
import LoginButton from '../reolmap/auth/LoginButton'

interface CommentFormProps {
  venueId?: string | null
  onCommentPosted?: () => void
  placeholder?: string
}

// XSS対策: HTMLエスケープ関数
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// XSS対策: 危険なパターンの検出
const containsDangerousContent = (text: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i
  ]
  return dangerousPatterns.some(pattern => pattern.test(text))
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  venueId = null, 
  onCommentPosted,
  placeholder
}) => {
  const { profile } = useAuth()
  const { t } = useTranslation('common')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingCommentId, setExistingCommentId] = useState<string | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)

  // 既存コメントを取得
  useEffect(() => {
    const loadExistingComment = async () => {
      if (profile) {
        const comment = await getUserLatestComment(profile.id, venueId)
        if (comment) {
          setExistingCommentId(comment.id)
          setContent(comment.content)
          setIsUpdate(true)
        }
      }
    }
    loadExistingComment()
  }, [profile, venueId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting || !profile) {
      console.log('Submit blocked:', { hasContent: !!content.trim(), isSubmitting, hasProfile: !!profile })
      return
    }

    // XSS対策: 危険なコンテンツをチェック
    if (containsDangerousContent(content)) {
      alert(t('comments.dangerousContent'))
      return
    }

    // コンテンツをサニタイズ（エスケープ）
    const sanitizedContent = escapeHtml(content.trim())

    console.log('Submitting comment:', { content: sanitizedContent, venueId, userId: profile.id, isUpdate })
    setIsSubmitting(true)
    try {
      if (isUpdate && existingCommentId) {
        // 既存コメントを削除して新しいコメントを作成（上書き）
        await deleteComment(existingCommentId)
      }
      
      const result = await createComment(sanitizedContent, venueId, profile.id)
      console.log('Comment result:', result)
      if (result) {
        setExistingCommentId(result.id)
        setIsUpdate(true)
        onCommentPosted?.()
      } else {
        alert(t('comments.postFailed'))
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('エラーが発生しました: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentLength = content.length
  const maxLength = 140

  if (!profile) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            {t('comments.loginRequired')}
          </p>
          <LoginButton compact />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 140))}
            placeholder={placeholder || t('comments.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={140}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-sm ${currentLength > maxLength - 20 ? 'text-red-500' : 'text-gray-500'}`}>
              {t('comments.characterCount', { current: currentLength, max: maxLength })}
            </span>
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (isUpdate ? t('comments.updating') : t('comments.posting')) : (isUpdate ? t('comments.update') : t('comments.post'))}
            </button>
          </div>
        </div>
    </form>
  )
}
