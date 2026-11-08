import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'

const companyLinks = [
  ['Về chúng tôi', '/#ve-bbone'],
  ['Liên hệ', 'tel:0912345678'],
  ['Điều khoản', '/thong-tin/dieu-khoan'],
  ['Thông tin', '/kien-thuc'],
  ['Chính sách quyền riêng tư', '/thong-tin/quyen-rieng-tu'],
]
const serviceLinks = [
  ['Sản phẩm', '/san-pham'],
  ['Đặt lịch phòng khám', '/dat-lich'],
  ['Câu hỏi thường gặp', '/thong-tin/cau-hoi'],
  ['Điều khoản sử dụng', '/thong-tin/dieu-khoan'],
]

function FooterLinks({ title, items }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-sm font-bold text-white">{title}</h2>
      <ul className="space-y-2.5 text-[13px] leading-5">
        {items.map(([label, to]) => (
          <li key={label}>
            <Link
              to={to}
              className="text-blue-100 transition hover:text-white hover:underline underline-offset-4"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-blue-100">
      <div className="mx-auto w-full max-w-[90rem] px-5 py-10 lg:px-8 2xl:px-10">
        <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1.1fr_1.2fr]">
          <div className="max-w-64">
            <Link
              to="/"
              aria-label="BBONE — Trang chủ"
              className="inline-flex flex-col items-center"
            >
              <img src="/favicon.svg" alt="" width="48" height="48" />
              <span className="mt-1 text-xl font-extrabold tracking-tight text-white">BBONE</span>
              <span className="mt-1 text-[8px] font-medium tracking-wide text-blue-200">
                CHỦ ĐỘNG THAY ĐỔI, HƯỚNG TỚI TƯƠNG LAI
              </span>
            </Link>
            <address className="mt-5 text-xs leading-5 text-blue-100/80 not-italic">
              Địa chỉ: 68 đường Sương Nguyệt Ánh,
              <br />
              Phường Phạm Ngũ Lão, Quận 1,
              <br />
              Hồ Chí Minh
            </address>
          </div>
          <FooterLinks title="BBONE" items={companyLinks} />
          <FooterLinks title="Dịch vụ" items={serviceLinks} />
          <div className="self-start border-l border-white/20 pl-6 text-white lg:mt-1">
            <h2 className="text-sm font-bold">Liên hệ</h2>
            <p className="mt-3 text-xs leading-5 text-blue-100">
              Nếu bạn cần hỗ trợ, hãy liên hệ với chúng tôi qua số:
            </p>
            <a
              href="tel:0912345678"
              className="mt-4 inline-flex items-center gap-2 text-xl font-bold tracking-tight hover:underline"
            >
              <Phone size={19} fill="currentColor" />
              0912345678
            </a>
          </div>
        </div>
        <p className="mt-10 border-t border-white/15 pt-5 text-xs text-blue-100/60">
          Mã số doanh nghiệp: 0912345
        </p>
      </div>
    </footer>
  )
}
