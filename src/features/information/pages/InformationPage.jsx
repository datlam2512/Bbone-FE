import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, Phone, MapPin, CalendarDays } from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { informationPages, informationLinks } from '../data/information-pages'

const routePages = {
  '/ve-chung-toi': 've-chung-toi',
  '/lien-he': 'lien-he',
  '/thong-tin': 'tong-quan',
}
export default function InformationPage() {
  const params = useParams()
  const location = useLocation()
  const slug = params.slug || routePages[location.pathname.replace(/\/$/, '')]
  const page = informationPages[slug]
  useEffect(() => {
    const previousTitle = document.title
    document.title = page ? page.label + ' | BBONE' : 'Không tìm thấy trang | BBONE'
    return () => {
      document.title = previousTitle
    }
  }, [page])

  if (!page)
    return (
      <VStack as="section" gap={5} className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-bold">Không tìm thấy trang thông tin</h1>
        <Link to="/thong-tin" className="text-brand-700 underline">
          Mở trung tâm thông tin
        </Link>
      </VStack>
    )
  return (
    <VStack as="section" gap={8} className="mx-auto w-full max-w-6xl px-5 py-9 lg:px-8 lg:py-12">
      <nav aria-label="Đường dẫn" className="text-xs text-slate-500">
        <Link to="/">Trang chủ</Link> / {page.label}
      </nav>
      <VStack
        as="header"
        gap={4}
        className="rounded-3xl border border-brand-100 bg-brand-50 p-6 sm:p-10"
      >
        <p className="text-xs font-bold tracking-widest text-brand-700">
          BBONE · {page.label.toUpperCase()}
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {page.title}
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-slate-600">{page.description}</p>
      </VStack>
      <section className="grid items-start gap-8 lg:grid-cols-4">
        <VStack
          as="aside"
          gap={4}
          className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24"
        >
          <h2 className="text-sm font-semibold">Thông tin BBONE</h2>
          <nav aria-label="Trang thông tin">
            <ul className="space-y-1">
              {informationLinks.map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={location.pathname === to ? 'page' : undefined}
                    className={
                      'block rounded-lg px-3 py-2.5 text-sm ' +
                      (location.pathname === to
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50')
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </VStack>
        <VStack as="article" gap={6} className="min-w-0 lg:col-span-3">
          {slug === 'lien-he' && (
            <section className="grid gap-4 sm:grid-cols-2">
              <VStack gap={3} className="rounded-2xl border border-brand-100 p-5">
                <Phone className="text-brand-600" size={23} />
                <h2 className="font-semibold">Hỗ trợ qua điện thoại</h2>
                <a href="tel:0912345678" className="text-xl font-bold text-brand-700">
                  0912345678
                </a>
                <p className="text-xs leading-6 text-slate-500">
                  Theo kênh liên hệ đang được công bố trên website.
                </p>
              </VStack>
              <VStack gap={3} className="rounded-2xl border border-brand-100 p-5">
                <MapPin className="text-brand-600" size={23} />
                <h2 className="font-semibold">Địa chỉ liên hệ</h2>
                <address className="text-sm leading-7 text-slate-600 not-italic">
                  68 đường Sương Nguyệt Ánh, Phường Phạm Ngũ Lão, Quận 1, Hồ Chí Minh
                </address>
              </VStack>
            </section>
          )}
          {slug === 'tong-quan' && (
            <section className="grid gap-4 sm:grid-cols-2">
              {informationLinks
                .filter(([, to]) => to !== '/thong-tin')
                .map(([label, to, description]) => (
                  <Link
                    key={to}
                    to={to}
                    className="space-y-2 rounded-2xl border border-slate-200 p-5 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <h2 className="flex items-center justify-between gap-3 font-semibold">
                      {label}
                      <ArrowRight size={17} />
                    </h2>
                    <p className="text-sm leading-7 text-slate-600">{description}</p>
                  </Link>
                ))}
            </section>
          )}
          {page.sections.map(([title, text], index) =>
            slug === 'cau-hoi' ? (
              <details key={title} className="rounded-xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-semibold leading-7">{title}</summary>
                <p className="mt-3 text-sm leading-8 text-slate-600">{text}</p>
              </details>
            ) : (
              <section
                key={title}
                id={'muc-' + (index + 1)}
                className="space-y-3 border-b border-slate-100 pb-7"
              >
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <p className="text-sm leading-8 text-slate-600">{text}</p>
              </section>
            ),
          )}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-50 p-5">
            <p className="text-sm font-medium text-brand-900">
              Tiếp tục hành trình chăm sóc của bạn.
            </p>
            <Link
              to="/phong-kham"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              <CalendarDays size={18} />
              Tìm phòng khám
              <ArrowRight size={16} />
            </Link>
          </section>
        </VStack>
      </section>
    </VStack>
  )
}
