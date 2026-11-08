import { Link } from 'react-router-dom'
import {
  ArrowRight,
  HeartPulse,
  CalendarDays,
  MapPin,
  ShoppingBag,
  BookOpen,
  CircleCheck,
} from 'lucide-react'

const shortcuts = [
  ['/kiem-tra-suc-khoe', 'Kiểm tra sức khỏe', 'Lắng nghe cơ thể bạn', HeartPulse],
  ['/dat-lich', 'Đặt lịch khám', 'Chọn thời gian phù hợp', CalendarDays],
  ['/phong-kham', 'Tìm phòng khám', 'Khám phá cơ sở chăm sóc', MapPin],
  ['/san-pham', 'Sản phẩm', 'Chủ động chăm sóc mỗi ngày', ShoppingBag],
  ['/kien-thuc', 'Kiến thức', 'Hiểu hơn về xương khớp', BookOpen],
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-brand-100">
        <div className="relative z-10 grid gap-6 px-7 py-12 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <h1 className="max-w-xl text-4xl leading-[1.2] font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Vững bước hôm nay.
              <br />
              <span className="text-brand-600">Khỏe mạnh ngày mai.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-500">
              Lắng nghe cơ thể, tìm nơi chăm sóc phù hợp và xây dựng thói quen tốt cho sức khỏe
              xương khớp của bạn.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/kiem-tra-suc-khoe"
                className="inline-flex items-center gap-3 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/15 transition hover:bg-brand-700"
              >
                Khám phá sức khỏe <ArrowRight size={18} />
              </Link>
              <Link
                to="/phong-kham"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink"
              >
                <MapPin size={17} />
                Tìm phòng khám
              </Link>
            </div>
          </div>
          <div
            className="relative mx-auto flex min-h-72 w-full max-w-md items-center justify-center lg:min-h-96"
            aria-hidden="true"
          >
            <div className="absolute size-64 rounded-full border border-white/90 bg-white/40 sm:size-80" />
            <div className="absolute size-52 rounded-full border border-brand-200/70 sm:size-64" />
            <svg
              viewBox="0 0 300 320"
              className="relative h-72 w-72 drop-shadow-2xl sm:h-80 sm:w-80"
            >
              <defs>
                <linearGradient id="bone" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#93cfff" />
                  <stop offset="0.5" stopColor="#0066ee" />
                  <stop offset="1" stopColor="#00379c" />
                </linearGradient>
              </defs>
              <path
                d="M125 42c-28-15-50 8-39 33 5 12 18 16 29 12l51 133c-10 7-14 21-6 32 16 24 42 10 42-8 22 7 42-18 25-37-9-10-23-11-32-4L145 70c20-16 5-43-14-37-2 1-4 4-6 9Z"
                fill="url(#bone)"
                stroke="white"
                strokeWidth="3"
              />
              <path
                d="m123 99 37 94"
                stroke="#b8ddff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity=".6"
              />
              <circle
                cx="147"
                cy="155"
                r="34"
                fill="white"
                fillOpacity=".15"
                stroke="white"
                strokeOpacity=".7"
              />
              <circle cx="147" cy="155" r="21" fill="#e6f4ff" fillOpacity=".5" />
              <path
                d="M132 155h10l5-10 6 20 5-10h7"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute right-0 bottom-4 flex items-center gap-3 rounded-2xl border border-white bg-white/95 px-5 py-4 shadow-card">
              <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                <HeartPulse size={25} />
              </span>
              <div>
                <p className="text-xs text-slate-500">Một bước nhỏ mỗi ngày</p>
                <p className="mt-1 text-sm font-semibold">Chủ động chăm sóc bản thân</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-label="Tiện ích chăm sóc sức khỏe"
        className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {shortcuts.map(([to, title, description, Icon]) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-brand-200 motion-reduce:transform-none"
          >
            <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
              <Icon size={22} />
            </span>
            <h2 className="mt-5 text-sm font-bold">{title}</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>
            <ArrowRight
              className="mt-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600"
              size={17}
            />
          </Link>
        ))}
      </section>
      <section className="mt-14 flex flex-col justify-between gap-6 rounded-2xl border border-slate-100 bg-white p-7 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-600 uppercase">
            Đồng hành cùng BBONE
          </p>
          <h2 className="mt-3 text-2xl font-bold">Hiểu cơ thể, chọn cách chăm sóc phù hợp.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Khám phá thông tin sức khỏe và các địa điểm chăm sóc trong cùng một nơi.
          </p>
        </div>
        <Link
          to="/kien-thuc"
          className="inline-flex shrink-0 items-center gap-3 text-sm font-semibold text-brand-600"
        >
          Khám phá kiến thức <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
