import React, { useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, X as XIcon } from 'lucide-react'
import { FaXTwitter } from 'react-icons/fa6'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface XAccountQRCodeModalProps {
  userId: string
  onClose: () => void
}

export const XAccountQRCodeModal: React.FC<XAccountQRCodeModalProps> = ({ userId, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null)
  const xUrl = `https://x.com/${userId}`
  useBodyScrollLock()

  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const padding = 32
    const labelHeight = 48
    const exportCanvas = document.createElement('canvas')
    const size = canvas.width + padding * 2
    exportCanvas.width = size
    exportCanvas.height = size + labelHeight
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    ctx.drawImage(canvas, padding, padding)

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
        className="bg-bx-bg border border-bx-line rounded-lg shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-bx-ink inline-flex items-center gap-2">
            QRコード
            <FaXTwitter className="h-5 w-5" />
          </h3>
          <button aria-label="閉じる" onClick={onClose} className="text-bx-ink2 hover:text-bx-ink">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

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

          <p className="text-sm text-bx-ink2">@{userId}</p>

          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-bx-blue hover:opacity-80 underline"
          >
            {xUrl}
          </a>
        </div>

        <button
          onClick={handleDownload}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-bx-yellow text-bx-bg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          画像を保存
        </button>
      </div>
    </div>
  )
}
