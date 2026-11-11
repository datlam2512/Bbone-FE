import { useEffect, useRef } from 'react'
import { Button } from '@astryxdesign/core/Button'

/** Shared accessible dialog for admin forms and record details. */
export default function AdminDialog({ open, title, onClose, children, size = 'max-w-3xl' }) {
  const dialog = useRef(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby="admin-dialog-title"
      onClose={onClose}
      className={`m-auto max-h-screen w-full ${size} overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50`}
    >
      <section className="flex max-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <h2 id="admin-dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button label="Đóng" size="sm" variant="ghost" onClick={() => dialog.current?.close()} />
        </header>
        <section className="overflow-y-auto px-5 py-5 sm:px-7">{children}</section>
      </section>
    </dialog>
  )
}
