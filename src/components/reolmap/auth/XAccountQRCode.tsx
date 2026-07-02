import React, { useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, X as XIcon } from 'lucide-react'
import { FaXTwitter } from 'react-icons/fa6'
import { useTranslation } from 'react-i18next'

interface XAccountQRCodeProps {
  userId: string
  onClose: () => void
}

const XAccountQRCode: React.FC<XAccountQRCodeProps> = ({ userId, onClose }) => {
  const { t } = useTranslation('common')
  const qrRef = useRef<HTMLDivElement>(null)
  const xUrl = `https://x.com/${userId}`

  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    // 余白付きの新しいキャンバスを作成
    const padding = 32
    const labelHeight = 48
    const exportCanvas = document.createElement('canvas')
    const size = canvas.width + padding * 2
    exportCanvas.width = size
    exportCanvas.height = size + labelHeight
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    // 白背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // QRコードを中央に描画
    ctx.drawImage(canvas, padding, padding)

    // ラベル
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 20px -apple-system, "Hiragino Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`@${userId}`, exportCanvas.width / 2, size + labelHeight / 2)

    exportCanvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `x_qr_${userId}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [userId])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
            {t('qrcode.title', 'QRコード')}
            <FaXTwitter className="h-5 w-5" />
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* QRコード */}
        <div ref={qrRef} className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeCanvas
              value={xUrl}
              size={200}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            @{userId}
          </p>

          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 underline"
          >
            {xUrl}
          </a>
        </div>

        {/* ダウンロードボタン */}
        <button
          onClick={handleDownload}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          {t('qrcode.download', '画像を保存')}
        </button>
      </div>
    </div>
  )
}

export default XAccountQRCode
