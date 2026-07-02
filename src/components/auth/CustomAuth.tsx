import React, { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'

interface CustomAuthProps {
  view?: 'sign_in' | 'sign_up'
  onClose?: () => void
}

export const CustomAuth: React.FC<CustomAuthProps> = ({ view = 'sign_in', onClose }) => {
  const [currentView, setCurrentView] = useState<'sign_in' | 'sign_up'>(view)

  if (!supabase) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentView === 'sign_in' ? 'ログイン' : 'アカウント作成'}
          </h2>
          <p className="text-gray-600">美辞学ナビへようこそ</p>
        </div>

        <Auth
          supabaseClient={supabase}
          view={currentView}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8b5cf6',
                  brandAccent: '#7c3aed',
                }
              }
            },
            style: {
              button: {
                background: '#8b5cf6',
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px 16px'
              },
              input: {
                borderRadius: '8px',
                fontSize: '16px',
                padding: '12px 16px'
              }
            }
          }}
          localization={{
            variables: {
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'アカウント作成',
                loading_button_label: '作成中...',
                social_provider_text: '{{provider}}でログイン',
                link_text: 'アカウントをお持ちでない方はこちら',
                confirmation_text: 'メールアドレスに確認リンクをお送りしました'
              },
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'ログイン',
                loading_button_label: 'ログイン中...',
                social_provider_text: '{{provider}}でログイン',
                link_text: 'すでにアカウントをお持ちの方はこちら'
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={false}
          magicLink={false}
        />

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView(currentView === 'sign_in' ? 'sign_up' : 'sign_in')}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            {currentView === 'sign_in' 
              ? 'アカウントをお持ちでない方はこちら'
              : 'すでにアカウントをお持ちの方はこちら'
            }
          </button>
        </div>
      </div>
    </div>
  )
}