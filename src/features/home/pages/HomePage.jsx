import CareHero from '../components/CareHero'

import FeaturedContent from '../components/FeaturedContent'
import { Link } from 'react-router-dom'
import { ArrowRight, HeartPulse, CalendarDays, MapPin, ShoppingBag, BookOpen } from 'lucide-react'

const shortcuts = [
  ['/kiem-tra-suc-khoe', 'Kiểm tra sức khỏe', 'Lắng nghe cơ thể bạn', HeartPulse],
  ['/dat-lich', 'Đặt lịch khám', 'Chọn thời gian phù hợp', CalendarDays],
  ['/phong-kham', 'Tìm phòng khám', 'Khám phá cơ sở chăm sóc', MapPin],
  ['/san-pham', 'Sản phẩm', 'Chủ động chăm sóc mỗi ngày', ShoppingBag],
  ['/kien-thuc', 'Kiến thức', 'Hiểu hơn về xương khớp', BookOpen],
]

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 pt-8 lg:px-8 2xl:px-10">
      <CareHero />
      <section
        aria-label="Tiện ích chăm sóc sức khỏe"
        className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      >
        {shortcuts.map(([to, title, description, Icon]) => (
          <Link
            key={to}
            to={to}
            className="group flex min-h-28 items-start gap-4 border-t border-slate-200 px-3 py-5 transition-colors hover:border-brand-600 sm:min-h-32 lg:border-t-0 lg:border-l lg:px-5 lg:first:border-l-0"
          >
            <span className="mt-0.5 text-brand-700">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
              <ArrowRight
                className="mt-3 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-700"
                size={16}
              />
            </div>
          </Link>
        ))}
      </section>
      <FeaturedContent />
      <section
        id="ve-bbone"
        className="mt-16 flex flex-col justify-between gap-6 border-y border-slate-200 py-8 sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
            Đồng hành cùng BBONE
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Hiểu cơ thể, chọn cách chăm sóc phù hợp.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Khám phá thông tin sức khỏe và các địa điểm chăm sóc trong cùng một nơi.
          </p>
        </div>
        <Link
          to="/kien-thuc"
          className="inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-brand-700"
        >
          Khám phá kiến thức <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
