import { loginDestination } from '../lib/login-destination'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { Field } from '@/shared/components/ui/Workflow'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import { signIn } from '../services/session.service'
import { useAuthStore } from '../stores/auth.store'

export default function LoginPage() {
  const navigate = useNavigate(),
    location = useLocation(),
    user = useAuthStore((s) => s.user)
  const [pending, setPending] = useState(false),
    [error, setError] = useState(null),
    [totpRequired, setTotpRequired] = useState(false),
    [verify, setVerify] = useState(false)
  if (user) return <Navigate to={loginDestination(user.role, location.state?.from)} replace />
  async function submit(e) {
    e.preventDefault()
    if (pending) return
    const f = new FormData(e.currentTarget)
    setPending(true)
    setError(null)
    setVerify(false)
    try {
      const authenticated = await signIn({
        email: f.get('email').trim(),
        password: f.get('password'),
        totpCode: f.get('totpCode')?.trim() || null,
        roleContext: null,
      })
      navigate(loginDestination(authenticated.role, location.state?.from), { replace: true })
    } catch (failure) {
      setError(failure.message)
      if (failure.code === 'MFA_REQUIRED') setTotpRequired(true)
      if (failure.code?.includes('VERIF')) setVerify(true)
    } finally {
      setPending(false)
    }
  }
  return (
    <AuthLayout
      title="Chào mừng bạn trở lại"
      description="Đăng nhập để xem lịch hẹn và tiếp tục chăm sóc sức khỏe cùng BBONE."
    >
      {location.state?.notice && (
        <p role="status" className="rounded-lg bg-brand-50 p-4 text-sm leading-6 text-brand-700">
          {location.state.notice}
        </p>
      )}
      <form onSubmit={submit} className="space-y-5">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="Email của bạn"
          autoComplete="username"
          required
          maxLength={254}
        />
        <PasswordField />
        <VStack gap={3}>
          <Link
            to="/quen-mat-khau"
            className="self-end text-sm font-medium text-brand-700 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </VStack>
        {totpRequired && (
          <Field
            label="Mã xác thực 6 chữ số"
            name="totpCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {error}
          </p>
        )}
        {verify && (
          <Link to="/xac-minh" className="block text-sm text-brand-700">
            Xác minh tài khoản / gửi lại email →
          </Link>
        )}
        <Button
          type="submit"
          label="Đăng nhập"
          variant="primary"
          size="lg"
          width="100%"
          isLoading={pending}
        />
      </form>
      <p className="text-center text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="font-semibold text-brand-700 hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </AuthLayout>
  )
}
