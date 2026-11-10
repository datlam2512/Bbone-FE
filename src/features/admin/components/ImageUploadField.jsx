import ImageCropDialog from './ImageCropDialog'
import { ImageLibraryDialog } from './ImageLibrary'
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { mediaUrl } from '@/shared/lib/media'
import { api } from '@/shared/api/client'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
export default function ImageUploadField({ name, label, kind, initialUrl = '', onBusyChange }) {
  const [cropFile, setCropFile] = useState(null),
    [libraryOpen, setLibraryOpen] = useState(false)
  const [url, setUrl] = useState(initialUrl),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  const input = useRef(null),
    controller = useRef(null),
    revision = useRef(0)
  useEffect(
    () => () => {
      controller.current?.abort()
      onBusyChange(false)
    },
    [onBusyChange],
  )
  function choose(event) {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''
    setError('')
    setNotice('')
    if (!allowedTypes.includes(file.type)) {
      setError('Chọn ảnh JPG, PNG hoặc WebP.')
      return
    }
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError('Ảnh phải có dung lượng từ 1 byte đến 5 MB.')
      return
    }
    setCropFile(file)
  }
  async function upload(file) {
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh sau xử lý vượt 5 MB. Vui lòng chọn ảnh nhỏ hơn.')
      setCropFile(null)
      return
    }
    setCropFile(null)
    controller.current?.abort()
    const abort = new AbortController(),
      current = ++revision.current
    controller.current = abort
    setBusy(true)
    onBusyChange(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const saved = await api.post('/admin/media/' + kind, form, { signal: abort.signal })
      if (abort.signal.aborted || current !== revision.current) return
      setUrl(saved.url)
      setNotice(
        'Đã tải ảnh (' + saved.width + ' × ' + saved.height + '). Bấm Lưu thay đổi để áp dụng.',
      )
    } catch (error) {
      if (!abort.signal.aborted && current === revision.current) setError(error.message)
    } finally {
      if (!abort.signal.aborted && current === revision.current) {
        setBusy(false)
        onBusyChange(false)
      }
    }
  }
  return (
    <VStack as="section" gap={3} className="sm:col-span-2">
      <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
      <HStack gap={4} wrap="wrap" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <section className="flex h-32 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          {url ? (
            <img
              key={url}
              src={mediaUrl(url)}
              alt={'Xem trước ' + label.toLowerCase()}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImagePlus size={32} className="text-slate-400" />
          )}
        </section>
        <VStack gap={3} className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-slate-600">
            Tải ảnh từ máy tính. JPG, PNG hoặc WebP; tối đa 5 MB và 20 megapixel.
          </p>
          <HStack gap={2} wrap="wrap">
            <Button
              label={url ? 'Thay ảnh' : 'Tải ảnh lên'}
              icon={<Upload size={16} />}
              isLoading={busy}
              onClick={() => input.current?.click()}
            />
            {url && kind !== 'clinics' && (
              <Button
                label="Bỏ ảnh"
                icon={<X size={16} />}
                variant="ghost"
                isDisabled={busy}
                onClick={() => {
                  setUrl('')
                  setNotice('Bấm Lưu thay đổi để bỏ ảnh.')
                  setError('')
                }}
              />
            )}
          </HStack>
          <p className="text-xs leading-6 text-slate-500">
            Ảnh tải lên là ảnh công khai. Không tải giấy tờ, hồ sơ y tế hoặc thông tin riêng tư.
          </p>
        </VStack>
      </HStack>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={'Chọn tệp ' + label.toLowerCase()}
        onChange={choose}
        disabled={busy}
        className="sr-only"
      />
      <Button label="Chọn từ thư viện ảnh" isDisabled={busy} onClick={() => setLibraryOpen(true)} />
      {cropFile && (
        <ImageCropDialog file={cropFile} onClose={() => setCropFile(null)} onConfirm={upload} />
      )}
      {libraryOpen && (
        <ImageLibraryDialog
          onClose={() => setLibraryOpen(false)}
          onSelect={(value) => {
            setUrl(value)
            setLibraryOpen(false)
            setNotice('Đã chọn ảnh. Bấm Lưu thay đổi để áp dụng.')
            setError('')
          }}
        />
      )}
      <input type="hidden" name={name} value={url} />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-brand-700">
          {notice}
        </p>
      )}
    </VStack>
  )
}
