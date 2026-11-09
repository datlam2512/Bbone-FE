import { Link, NavLink } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import MediaImage from '@/shared/components/ui/MediaImage'
import { demoMedia } from '@/shared/lib/media'

export default function AuthLayout({ title, description, children, tabs = true }) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-14">
      <VStack
        gap={6}
        className="hidden rounded-2xl bg-brand-50 p-7 lg:flex sm:p-9 lg:justify-between"
      >
        <VStack gap={4}>
          <p className="text-xs font-semibold tracking-widest text-brand-700 uppercase">
            Tài khoản BBONE
          </p>
          <h2 className="max-w-md text-3xl leading-snug font-semibold tracking-tight text-ink sm:text-4xl">
            Một nơi để chăm sóc
            <br />
            sức khỏe của bạn.
          </h2>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            Đặt lịch khám, theo dõi đơn hàng và lưu thông tin chăm sóc xương khớp trong cùng một tài
            khoản.
          </p>
        </VStack>
        <MediaImage
          src={demoMedia.hero}
          alt="Trao đổi về chăm sóc sức khỏe tại phòng khám"
          className="hidden aspect-video rounded-xl sm:block"
        />
        <HStack gap={5} wrap="wrap" className="border-t border-brand-200 pt-5">
          <p className="text-xs text-slate-600">Lịch hẹn của bạn</p>
          <p className="text-xs text-slate-600">Đơn hàng của bạn</p>
          <p className="text-xs text-slate-600">Thông tin của bạn</p>
        </HStack>
      </VStack>
      <VStack gap={6} className="mx-auto w-full max-w-lg justify-center py-3 lg:py-6">
        {tabs && (
          <nav aria-label="Tài khoản" className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[
              ['/dang-nhap', 'Đăng nhập'],
              ['/dang-ky', 'Đăng ký'],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  'flex-1 rounded-lg px-5 py-3 text-center text-sm font-semibold transition ' +
                  (isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-ink')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
        <VStack gap={2}>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="text-sm leading-7 text-slate-500">{description}</p>
        </VStack>
        {children}
        <p className="border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">
          Bạn cần trợ giúp?{' '}
          <Link to="/thong-tin/cau-hoi" className="font-medium text-brand-700 hover:underline">
            Xem câu hỏi thường gặp
          </Link>
        </p>
      </VStack>
    </section>
  )
}
