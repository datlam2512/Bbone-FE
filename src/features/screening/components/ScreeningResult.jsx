import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, BookOpen, RotateCcw, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/VStack'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { bodyRegions, outcomeLabels } from '../lib/screening-content'
import JointIllustration from './JointIllustration'
export default function ScreeningResult({ flow }) {
  const user = useAuthStore((state) => state.user)
  const [consent, setConsent] = useState(false)
  const { result, command } = flow
  const region = bodyRegions.find((item) => item.id === result.region)
  const urgent = ['Emergency', 'Urgent'].includes(result.outcome)
  return (
    <section className="grid items-start gap-6 lg:grid-cols-3">
      <VStack
        gap={5}
        className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2"
      >
        <h1 className="text-2xl font-bold">Hướng dẫn cho tình trạng của bạn</h1>
        <section className="grid items-center gap-6 sm:grid-cols-3">
          <VStack gap={3} className="rounded-2xl bg-brand-50 p-5">
            <JointIllustration region={region.id} large />
            <h2 className="text-center font-semibold">{region.label}</h2>
          </VStack>
          <VStack gap={4} className="sm:col-span-2">
            <section
              role="status"
              className={
                'flex items-start gap-3 rounded-xl p-4 ' +
                (urgent ? 'bg-orange-50 text-orange-900' : 'bg-brand-50 text-brand-900')
              }
            >
              {urgent ? (
                <AlertTriangle size={24} className="shrink-0" />
              ) : (
                <ClipboardCheck size={24} className="shrink-0" />
              )}
              <h2 className="font-bold leading-7">{outcomeLabels[result.outcome]}</h2>
            </section>
            <p className="text-sm leading-7 text-slate-700">{result.advice}</p>
          </VStack>
        </section>
        {result.reasons.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold">Câu trả lời cần lưu ý</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        )}
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold">Xem lại câu trả lời</summary>
          <dl className="mt-4 space-y-4">
            {flow.questions.map((q) => (
              <section key={q.id}>
                <dt className="text-sm text-slate-600">{q.label}</dt>
                <dd className="mt-1 text-sm font-semibold">{flow.answers[q.id]}</dd>
              </section>
            ))}
          </dl>
        </details>
        <section className="space-y-2 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-semibold">Nguồn tham khảo</h2>
          {result.sources.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block break-all text-xs leading-6 text-brand-700 underline"
            >
              NHS — {url.split('/').filter(Boolean).at(-1).replaceAll('-', ' ')}
            </a>
          ))}
          <p className="text-xs leading-6 text-slate-500">{result.disclaimer}</p>
        </section>
      </VStack>
      <VStack as="aside" gap={5} className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="text-lg font-bold">Bước tiếp theo</h2>
        {urgent ? (
          <p className="rounded-xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">
            Ưu tiên liên hệ cơ sở y tế. Lịch khám thông thường và sản phẩm hỗ trợ không thay thế xử
            trí khẩn.
          </p>
        ) : (
          <Link
            to="/dat-lich"
            className="flex items-center gap-3 rounded-xl bg-brand-600 p-4 font-semibold text-white"
          >
            <CalendarDays size={22} />
            Đặt lịch khám
          </Link>
        )}
        <Link
          to="/kien-thuc"
          className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm font-semibold text-brand-800"
        >
          <BookOpen size={20} />
          Kiến thức xương khớp
        </Link>
        {user ? (
          flow.saved ? (
            <Link to="/tai-khoan/kiem-tra" className="text-sm text-emerald-700">
              Đã lưu vào hồ sơ tài khoản.
            </Link>
          ) : (
            <VStack gap={3}>
              <label className="flex gap-2 text-xs leading-6">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 size-4 shrink-0 accent-brand-600"
                />
                Tôi đồng ý lưu bản ghi triệu chứng vào tài khoản.
              </label>
              <Button
                label="Lưu vào hồ sơ"
                onClick={flow.save}
                isLoading={command.pending}
                isDisabled={!consent}
              />
            </VStack>
          )
        ) : (
          <p className="text-xs leading-6 text-slate-500">
            Bạn đang xem kết quả không cần tài khoản. Đăng nhập trước khi kiểm tra nếu muốn lưu vào
            hồ sơ.
          </p>
        )}
        <Button
          label="Kiểm tra lại"
          icon={<RotateCcw size={16} />}
          onClick={flow.restart}
          isDisabled={command.pending}
        />
      </VStack>
    </section>
  )
}
