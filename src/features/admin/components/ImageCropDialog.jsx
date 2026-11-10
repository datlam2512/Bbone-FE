import { cropRectangle, cropOutputSize } from '../lib/image-crop'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Field } from '@/shared/components/ui/Workflow'

export default function ImageCropDialog({ file, onConfirm, onClose }) {
  const dialog = useRef(null),
    canvas = useRef(null),
    bitmap = useRef(null)
  const [dimensions, setDimensions] = useState(null),
    [ratio, setRatio] = useState('original'),
    [zoom, setZoom] = useState(1),
    [x, setX] = useState(0.5),
    [y, setY] = useState(0.5),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false)
  useEffect(() => {
    dialog.current.showModal()
    let active = true
    createImageBitmap(file)
      .then((image) => {
        if (!active) {
          image.close()
          return
        }
        if (image.width > 8192 || image.height > 8192 || image.width * image.height > 20000000) {
          image.close()
          setError('Ảnh tối đa 8192 pixel mỗi chiều và 20 megapixel.')
          return
        }
        bitmap.current = image
        setDimensions({ width: image.width, height: image.height })
      })
      .catch(() => {
        if (active) setError('Không đọc được ảnh. Vui lòng chọn tệp khác.')
      })
    return () => {
      active = false
      bitmap.current?.close()
    }
  }, [file])
  const aspect =
    ratio === 'original' && dimensions ? dimensions.width / dimensions.height : Number(ratio) || 1
  const width = Math.max(1, Math.round(Math.min(600, 600 * aspect))),
    height = Math.max(1, Math.round(width / aspect))
  const draw = useCallback(
    (target) => {
      const image = bitmap.current
      if (!image || !target) return
      const rect = cropRectangle(image.width, image.height, aspect, zoom, x, y)
      const context = target.getContext('2d')
      context.clearRect(0, 0, target.width, target.height)
      context.drawImage(
        image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        target.width,
        target.height,
      )
    },
    [aspect, zoom, x, y],
  )
  useEffect(() => {
    draw(canvas.current)
  }, [draw, dimensions, width, height])
  async function save() {
    if (!bitmap.current) return
    setSaving(true)
    try {
      const output = document.createElement('canvas')
      const size = cropOutputSize(bitmap.current.width, bitmap.current.height, aspect, zoom)
      output.width = size.width
      output.height = size.height
      draw(output)
      const blob = await new Promise((resolve) => output.toBlob(resolve, 'image/webp', 0.9))
      if (!blob) throw new Error('Không xuất được ảnh.')
      await onConfirm(new File([blob], 'catalog-image.webp', { type: 'image/webp' }))
    } catch (error) {
      setError(error.message)
      setSaving(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault()
        if (!saving) onClose()
      }}
      aria-labelledby="crop-image-title"
      className="m-auto max-h-screen w-full max-w-3xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 backdrop:bg-slate-900/40 sm:p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 id="crop-image-title" className="text-lg font-bold">
          Căn chỉnh ảnh trước khi tải
        </h2>
        <Button label="Hủy" onClick={onClose} isDisabled={saving} />
      </header>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <canvas
        ref={canvas}
        width={width}
        height={height}
        role="img"
        aria-label="Xem trước vùng ảnh sẽ sử dụng"
        className="mx-auto max-h-80 max-w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
      />
      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tỷ lệ ảnh"
          type="select"
          value={ratio}
          onChange={(event) => setRatio(event.target.value)}
        >
          <option value="original">Giữ tỷ lệ gốc</option>
          <option value="1">Vuông 1:1</option>
          <option value={4 / 3}>4:3</option>
          <option value={16 / 9}>Ngang 16:9</option>
        </Field>
        {[
          ['Phóng to', zoom, setZoom, 1, 3],
          ['Vị trí ngang', x, setX, 0, 1],
          ['Vị trí dọc', y, setY, 0, 1],
        ].map(([label, value, set, min, max]) => (
          <label key={label} className="space-y-3 text-sm font-medium text-slate-700">
            {label}
            <input
              type="range"
              className="block w-full"
              value={value}
              min={min}
              max={max}
              step="0.01"
              onChange={(event) => set(Number(event.target.value))}
            />
          </label>
        ))}
      </section>
      <p className="text-xs leading-6 text-slate-500">
        Bản gốc trên máy không bị thay đổi. Ảnh được xử lý trong trình duyệt trước khi upload.
      </p>
      <Button
        label="Dùng ảnh này & tải lên"
        variant="primary"
        isDisabled={!dimensions || !!error}
        isLoading={saving}
        onClick={save}
      />
    </dialog>
  )
}
