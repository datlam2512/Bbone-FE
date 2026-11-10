import { ArrowRight, Check, Heart, ShieldCheck, Timer } from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { bodyRegions } from '../lib/screening-content'
import JointIllustration from './JointIllustration'
export default function RegionSelection({ region, onSelect, onContinue }) {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <VStack
        gap={5}
        className="relative isolate min-h-96 overflow-hidden rounded-3xl bg-brand-50 p-6 sm:p-8"
      >
        <p className="relative z-10 text-xs font-bold tracking-widest text-brand-700">
          BBONE BODY CHECK
        </p>
        <h1 className="relative z-10 max-w-xs text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          Hiểu cơ thể.
          <br />
          Chủ động chăm sóc.
        </h1>
        <p className="relative z-10 max-w-64 text-sm leading-7 text-slate-600">
          Ghi nhận triệu chứng xương khớp và tìm hiểu khi nào bạn nên đi khám.
        </p>
        <img
          src="/images/screening/body-check.png"
          alt="Hình minh hoạ cơ thể và các vùng khớp"
          className="pointer-events-none absolute right-0 bottom-0 -z-10 h-full w-3/5 object-contain object-bottom opacity-60"
        />
        <VStack gap={3} className="relative z-10 mt-auto max-w-64">
          {[
            [Timer, 'Từng bước rõ ràng', 'Chọn vùng, trả lời và xem hướng dẫn'],
            [ShieldCheck, 'Nguồn y tế công khai', 'Tham khảo hướng dẫn từ NHS'],
            [Heart, 'Bạn làm chủ dữ liệu', 'Chỉ lưu hồ sơ khi bạn đồng ý'],
          ].map(([Icon, title, text]) => (
            <section key={title} className="flex items-center gap-3 rounded-xl bg-white/90 p-3">
              <Icon size={21} className="shrink-0 text-brand-600" aria-hidden="true" />
              <VStack gap={1}>
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="text-xs leading-5 text-slate-600">{text}</p>
              </VStack>
            </section>
          ))}
        </VStack>
      </VStack>
      <VStack gap={5} className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm sm:p-7">
        <VStack gap={2}>
          <h2 className="text-xl font-bold">Chọn vùng cơ thể đang gặp vấn đề</h2>
          <p className="text-sm leading-6 text-slate-600">Chọn vùng bạn muốn tìm hiểu trước.</p>
        </VStack>
        <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <legend className="sr-only">Vùng cơ thể</legend>
          {bodyRegions.map((item) => (
            <label
              key={item.id}
              className={
                'relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 p-1 transition-colors focus-within:ring-2 focus-within:ring-brand-600 ' +
                (item.id === 'wrist' ? 'col-span-2 sm:col-span-3 ' : '') +
                (region === item.id
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-100 bg-white hover:border-brand-300')
              }
            >
              <input
                type="radio"
                name="region"
                value={item.id}
                checked={region === item.id}
                onChange={() => onSelect(item.id)}
                className="sr-only"
              />
              {item.id !== 'wrist' && <JointIllustration region={item.id} />}
              <p className="px-1 py-2 text-center text-xs font-semibold text-ink">{item.label}</p>
              {region === item.id && (
                <Check
                  aria-hidden="true"
                  size={20}
                  className="absolute top-2 right-2 rounded-full bg-brand-600 p-0.5 text-white"
                />
              )}
            </label>
          ))}
        </fieldset>
        <Button
          label="Tiếp tục"
          endContent={<ArrowRight size={17} />}
          variant="primary"
          onClick={onContinue}
        />
        <p className="text-xs leading-5 text-slate-500">
          Dành cho người từ 18 tuổi. Nếu có triệu chứng nghiêm trọng, hãy đến cơ sở y tế ngay.
        </p>
      </VStack>
    </section>
  )
}
