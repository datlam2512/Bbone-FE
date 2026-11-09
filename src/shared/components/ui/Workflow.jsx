// Adapted from the Astryx blank template: shared content frame and heading.
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Link } from 'react-router-dom'
import { statusLabels } from '@/shared/lib/workflows'

export function Page({ title, description, children, back, actions }) {
  return (
    <VStack as="section" gap={6} className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">
      {back && (
        <Link to={back} className="text-sm text-slate-500 hover:text-brand-600">
          ← Quay lại
        </Link>
      )}
      <HStack wrap="wrap" hAlign="between" vAlign="center" gap={4}>
        <VStack gap={2}>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
          )}
        </VStack>
        {actions}
      </HStack>
      {children}
    </VStack>
  )
}
export function Panel({ title, children, className = '' }) {
  return (
    <VStack
      as="section"
      gap={4}
      className={'rounded-xl border border-slate-200 bg-white p-5 sm:p-6 ' + className}
    >
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {children}
    </VStack>
  )
}
export function Feedback({ command }) {
  return (
    <>
      {command.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {command.error}
        </p>
      )}
      {command.notice && (
        <p role="status" className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
          {command.notice}
        </p>
      )}
    </>
  )
}
export function Field({ label, name, type = 'text', children, ...props }) {
  const style =
    'mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100'
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-700">
      {label}
      {type === 'textarea' ? (
        <textarea name={name} className={style} rows={4} {...props} />
      ) : type === 'select' ? (
        <select name={name} className={style} {...props}>
          {children}
        </select>
      ) : (
        <input name={name} type={type} className={style} {...props} />
      )}
    </label>
  )
}
export function Submit({ command, label = 'Lưu thay đổi' }) {
  return <Button type="submit" variant="primary" label={label} isLoading={command.pending} />
}
export function Status({ value }) {
  return (
    <p
      className={
        'inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ' +
        (['Cancelled', 'DeliveryFailed', 'NoShow'].includes(value)
          ? 'bg-red-50 text-red-700'
          : ['Completed', 'Paid', 'Delivered'].includes(value)
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-brand-50 text-brand-700')
      }
    >
      {statusLabels[value] || value || 'Chưa cập nhật'}
    </p>
  )
}
export function Empty({ text = 'Chưa có dữ liệu.', to, label = 'Khám phá dịch vụ' }) {
  return (
    <Panel>
      <p className="py-5 text-sm text-slate-500">{text}</p>
      {to && (
        <Link to={to} className="text-sm font-semibold text-brand-600">
          {label} →
        </Link>
      )}
    </Panel>
  )
}
