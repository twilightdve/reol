/**
 * HelpGuideModal - 美辞学ナビ 使い方ガイドモーダル
 * 
 * ヘッダーの「?」アイコンやサイドメニューから開く。
 * 美辞学ナビの各機能の使い方をわかりやすく紹介する。
 */
import React from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LAYOUT } from '../../../constants/bijigaku'

interface HelpGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

interface GuideSection {
  emoji: string
  titleJa: string
  titleEn: string
  items: { ja: string; en: string }[]
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    emoji: '👀',
    titleJa: 'ログインなしでも使える機能',
    titleEn: 'Available Without Login',
    items: [
      { ja: '📅 ツアー日程タイムライン — 全公演の日程・ステータス・参加者数を一覧で確認', en: '📅 Tour Timeline — View all show dates, status, and attendee counts' },
      { ja: '🏟️ 会場詳細ページ — アクセス、コインロッカー、周辺グルメ・観光スポットなどを網羅', en: '🏟️ Venue Pages — Access info, coin lockers, nearby restaurants & sightseeing' },
      { ja: '📊 会場別参加者数グラフ — どの会場に何人参加するかを視覚的にチェック', en: '📊 Attendance Chart — Visualize how many fans are going to each venue' },
      { ja: '📖 コラム・記事 — ライヴ初心者向けTipsや会場ガイドなどの読み物', en: '📖 Articles — First-timer tips, venue guides, and more' },
      { ja: '🌏 日本語 / English 切り替え — ヘッダーの言語ボタンでいつでも切替可能', en: '🌏 Language Switch — Toggle Japanese / English anytime from the header' },
    ],
  },
  {
    emoji: '🔑',
    titleJa: 'アカウント登録・ログイン',
    titleEn: 'Sign Up & Log In',
    items: [
      { ja: 'ヘッダー右上のログインボタンからメールアドレスで無料登録', en: 'Sign up for free with your email via the login button in the top-right' },
      { ja: 'ログイン後、右上のアイコンからプロフィール設定（表示名・Xアカウント連携）', en: 'After login, set up your profile (display name, X account) from the icon' },
    ],
  },
  {
    emoji: '🏟️',
    titleJa: '参加表明をしよう',
    titleEn: 'Register Your Attendance',
    items: [
      { ja: 'トップの「あなたの参加公演」カードをタップして会場を選択', en: 'Tap "Your Shows" on the top page and select your venues' },
      { ja: '参加者一覧・タイムラインに反映され、あとからいつでも変更可能', en: 'Your selections appear in the attendee list & timeline. Editable anytime' },
    ],
  },
  {
    emoji: '👥',
    titleJa: '参加者一覧',
    titleEn: 'Attendee List',
    items: [
      { ja: '同じ会場に行くファン同士を発見！「🤝 ○会場一緒」バッジで共通会場がわかる', en: 'Find fans going to the same shows! "🤝 X venues together" badge shows overlap' },
      { ja: '登録順・更新順・参加数・共通会場数・名前でソート可能', en: 'Sort by registration date, last updated, show count, shared venues, or name' },
      { ja: '会場フィルターで特定の会場の参加者だけを表示', en: 'Filter attendees by specific venue' },
      { ja: '「エンカOK」フィルターで現地で会えるファンを絞り込み', en: 'Filter by "Encounter OK" to find fans open to meeting up' },
      { ja: '❤️ エンカしたいボタンで気になる参加者にアピール。相手もエンカしたいしていたら 💕 マークが表示される', en: '❤️ Tap "Want to meet" to express interest. If mutual, a 💕 badge appears' },
      { ja: '🎵 推し曲を設定すると、カードにSpotifyプレイヤーが表示される', en: '🎵 Set your favorite song and a Spotify player will appear on your card' },
      { ja: '🏷️ 「初ライブ」「初Reol」などのタグを自分のカードに設定できる', en: '🏷️ Add tags like "First live" or "First Reol show" to your card' },
      { ja: '💬 自分のカードにひとことコメントを投稿できる', en: '💬 Post a short comment on your card' },
    ],
  },
  {
    emoji: '🎨',
    titleJa: 'SNSシェア画像',
    titleEn: 'Share Image',
    items: [
      { ja: '参加予定会場を美辞学テーマのデザインで画像化してダウンロード・シェア', en: 'Generate a Bijigaku-themed image of your venues to download & share' },
    ],
  },
  {
    emoji: '📍',
    titleJa: '会場ページの活用',
    titleEn: 'Using Venue Pages',
    items: [
      { ja: 'アクセス・コインロッカー・駐車場・カフェ・レストラン・観光スポット・宿泊施設を掲載', en: 'Access, lockers, parking, cafés, restaurants, sightseeing, hotels & more' },
      { ja: '会場ごとのコメント欄で情報共有ができる', en: 'Share tips in the venue-specific comment section' },
      { ja: '遠征チェックリストで持ち物・準備・メモを管理', en: 'Manage packing, prep, and notes with the travel checklist' },
    ],
  },
]

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
        style={{ maxHeight: LAYOUT.MODAL_MAX_HEIGHT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEn ? 'How to Use Bijigaku Navi' : '美辞学ナビの使い方'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div
          className="overflow-y-auto p-5 space-y-5"
          style={{ maxHeight: LAYOUT.MODAL_BODY_MAX_HEIGHT }}
        >
          {/* イントロ */}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {isEn
              ? 'Bijigaku Navi is a fan-made web app to make Reol\'s "Bijigaku" tour even more enjoyable. Here\'s a quick guide to all the features.'
              : '美辞学ナビは、Reol「美辞学」ツアーをもっと楽しむためのファンメイドWebアプリです。各機能をかんたんにご紹介します。'}
          </p>

          {/* セクション */}
          {GUIDE_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{section.emoji}</span>
                <span>{isEn ? section.titleEn : section.titleJa}</span>
              </h3>
              <ul className="space-y-1.5 pl-1">
                {section.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-2 border-l-2 border-gray-200 dark:border-gray-600"
                  >
                    {isEn ? item.en : item.ja}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* フッター */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {isEn
                ? 'Just dive in and explore — enjoy the Bijigaku tour! 🎤✨'
                : 'わからないことがあっても、使いながら慣れていけば大丈夫。美辞学ツアーを楽しもう！🎤✨'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpGuideModal
