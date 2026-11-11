import { Link } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import MediaImage from '@/shared/components/ui/MediaImage'
import { careMedia } from '@/shared/lib/media'

export default function CareHero() {
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
      <section className="grid lg:grid-cols-2">
        <VStack gap={6} className="justify-center px-7 py-10 sm:px-10 sm:py-14 lg:px-12">
          <p className="text-xs font-semibold tracking-widest text-brand-700 uppercase">
            BBONE · Chăm sóc xương khớp
          </p>
          <h1 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
            Chăm sóc hôm nay.
            <br />
            <em className="font-normal text-brand-600 not-italic">Vững bước mỗi ngày.</em>
          </h1>
          <p className="max-w-lg text-base leading-8 text-slate-600">
            Từ kiểm tra sức khỏe đến tìm phòng khám và đặt lịch. BBONE giúp bạn bắt đầu việc chăm
            sóc xương khớp một cách dễ dàng.
          </p>
          <HStack gap={3} wrap="wrap">
            <Link
              to="/dat-lich"
              className="rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Đặt lịch khám →
            </Link>
            <Link
              to="/kiem-tra-suc-khoe"
              className="rounded-lg border border-brand-200 bg-white px-5 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              Kiểm tra sức khỏe
            </Link>
          </HStack>
          <p className="border-t border-brand-200 pt-5 text-xs leading-6 text-slate-500">
            Chọn cơ sở · Chọn thời gian · Xác nhận lịch hẹn
          </p>
        </VStack>
        <VStack className="relative min-w-0 justify-center p-5 lg:p-7">
          <MediaImage
            src={careMedia.hero}
            alt="Bác sĩ trò chuyện và tư vấn chăm sóc sức khỏe"
            priority
            className="aspect-video w-full rounded-xl lg:aspect-4/3"
          />
        </VStack>
      </section>
    </section>
  )
}
