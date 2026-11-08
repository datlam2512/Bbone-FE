import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import { signIn } from '../services/session.service'
import { useAuthStore } from '../stores/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  if (user) return <Navigate to="/tai-khoan" replace />
  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    try {
      await signIn({
        email: fields.get('email').trim(),
        password: fields.get('password'),
        totpCode: fields.get('totpCode').trim() || null,
        roleContext: null,
      })
      const from = location.state?.from
      navigate(from?.startsWith('/') && !from.startsWith('//') ? from : '/tai-khoan', {
        replace: true,
      })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setPending(false)
    }
  }
  const inputClass = 'mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm'
  return (
    <section className="mx-auto max-w-md px-5 py-14">
      <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-card sm:p-9">
        <span className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
          <LockKeyhole size={26} />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Chào mừng trở lại</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Đăng nhập để tiếp tục chăm sóc sức khỏe cùng BBONE.
        </p>
        {location.state?.notice && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-700"
          >
            {location.state.notice}
          </p>
        )}
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              className={inputClass}
              placeholder="ban@example.com"
            />
          </label>
          <label className="block text-sm font-medium">
            Mật khẩu
            <div className="relative">
              <input
                name="password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                maxLength={128}
                className={inputClass + ' pr-12'}
              />
              <button
                type="button"
                aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setVisible(!visible)}
                className="absolute top-4 right-3 p-1.5 text-slate-400"
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label className="block text-sm font-medium">
            Mã xác thực <span className="font-normal text-slate-400">(nếu đã bật MFA)</span>
            <input
              name="totpCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              className={inputClass}
              placeholder="6 chữ số"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            <ArrowRight size={17} />
          </Button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-slate-500">
          Trở về trang chủ
        </Link>
      </div>
    </section>
  )
}
