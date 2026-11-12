import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { Field, Feedback } from '@/shared/components/ui/Workflow'
import { useCommand } from '@/shared/hooks/use-command'
import { api } from '@/shared/api/client'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'

const titles = {
  register: 'Bắt đầu cùng BBONE',
  forgot: 'Lấy lại quyền truy cập',
  reset: 'Tạo mật khẩu mới',
  verify: 'Xác minh tài khoản',
}
export default function AuthSupportPage({ mode = 'register' }) {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    command = useCommand()
  const [sent, setSent] = useState(false),
    [email, setEmail] = useState(''),
    [validation, setValidation] = useState(null)
  async function submit(e) {
    e.preventDefault()
    setValidation(null)
    const f = new FormData(e.currentTarget)
    if (['register', 'reset'].includes(mode) && f.get('password') !== f.get('confirmPassword')) {
      setValidation('Hai mật khẩu chưa trùng khớp. Vui lòng kiểm tra lại.')
      return
    }
    const path = {
      register: '/auth/register',
      forgot: '/auth/forgot-password',
      reset: '/auth/reset-password',
      verify: '/auth/verify',
    }[mode]
    const body =
      mode === 'register'
        ? {
            name: f.get('name').trim(),
            phone: f.get('phone').trim(),
            email: f.get('email').trim(),
            password: f.get('password'),
            termsVersion: '1.0',
          }
        : mode === 'forgot'
          ? { email: f.get('email').trim() }
          : mode === 'reset'
            ? { token: f.get('token').trim(), password: f.get('password') }
            : { token: f.get('token').trim() }
    const ok = await command.run(
      () => api.post(path, body, { auth: false }),
      { mode },
      ['register', 'forgot'].includes(mode)
        ? 'Yêu cầu đã được ghi nhận. Nếu thông tin hợp lệ, hướng dẫn sẽ được gửi tới email đã đăng ký.'
        : 'Đã xác nhận thành công.',
    )
    if (ok) {
      if (['register', 'forgot'].includes(mode)) {
        setEmail(body.email)
        setSent(true)
      } else
        navigate('/dang-nhap', {
          replace: true,
          state: {
            notice:
              mode === 'verify'
                ? 'Email đã được xác minh. Bạn có thể đăng nhập.'
                : 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.',
          },
        })
    }
  }
  async function resend(e) {
    e.preventDefault()
    const address = new FormData(e.currentTarget).get('email').trim()
    await command.run(
      () => api.post('/auth/resend-verification', { email: address }, { auth: false }),
      { mode: 'resend', email: address },
      'Nếu tài khoản cần xác minh, email hướng dẫn sẽ được gửi lại. Vui lòng kiểm tra hộp thư và mục thư rác.',
    )
  }
  return (
    <AuthLayout
      title={sent ? 'Kiểm tra hộp thư của bạn' : titles[mode]}
      description={
        sent
          ? 'Hoàn tất bước xác minh để bảo vệ tài khoản của bạn.'
          : mode === 'register'
            ? 'Tạo tài khoản để đặt lịch và quản lý các dịch vụ chăm sóc sức khỏe.'
            : 'Làm theo hướng dẫn để tiếp tục truy cập tài khoản.'
      }
      tabs={mode === 'register'}
    >
      <Feedback command={command} />
      {validation && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {validation}
        </p>
      )}
      {sent ? (
        <VStack gap={5}>
          <p className="text-sm leading-7 text-slate-600">
            Địa chỉ đã nhập: <strong>{email}</strong>. Hãy kiểm tra cả mục thư rác. Chỉ tài khoản đã
            xác minh mới có thể đăng nhập.
          </p>
          {mode === 'register' && (
            <form onSubmit={resend} className="space-y-4 border-t border-slate-200 pt-5">
              <Field
                label="Chưa nhận được email?"
                name="email"
                type="email"
                defaultValue={email}
                required
                maxLength={254}
              />
              <Button
                type="submit"
                label="Gửi lại email xác minh"
                isLoading={command.pending}
              />
            </form>
          )}
          <Link
            to="/xac-minh"
            className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Tôi đã có mã xác minh
          </Link>
          <Link to="/dang-nhap" className="text-center text-sm font-medium text-brand-700">
            Trở về đăng nhập
          </Link>
        </VStack>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {mode === 'register' && (
            <section className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Họ và tên"
                name="name"
                placeholder="Tên của bạn"
                autoComplete="name"
                required
                maxLength={100}
              />
              <Field
                label="Điện thoại"
                name="phone"
                type="tel"
                placeholder="Số điện thoại"
                autoComplete="tel"
                required
                maxLength={30}
              />
            </section>
          )}
          {['register', 'forgot'].includes(mode) && (
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="Email bạn sử dụng"
              autoComplete="email"
              required
              maxLength={254}
            />
          )}
          {['reset', 'verify'].includes(mode) && (
            <Field
              label="Mã xác minh trong liên kết email"
              name="token"
              defaultValue={params.get('token') || ''}
              autoComplete="one-time-code"
              required
              maxLength={2000}
            />
          )}
          {['register', 'reset'].includes(mode) && (
            <>
              <PasswordField label="Mật khẩu" newPassword />
              <Field
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </>
          )}
          {mode === 'register' && (
            <label className="flex items-start gap-3 text-xs leading-6 text-slate-600">
              <input type="checkbox" required className="mt-1" />{' '}
              <p>
                Tôi đồng ý với{' '}
                <Link to="/thong-tin/dieu-khoan" className="text-brand-700 underline">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/thong-tin/quyen-rieng-tu" className="text-brand-700 underline">
                  Chính sách quyền riêng tư
                </Link>{' '}
                của BBONE.
              </p>
            </label>
          )}
          <Button
            type="submit"
            label={
              mode === 'register'
                ? 'Tạo tài khoản'
                : mode === 'forgot'
                  ? 'Gửi hướng dẫn khôi phục'
                  : mode === 'verify'
                    ? 'Xác minh email'
                    : 'Lưu mật khẩu mới'
            }
            variant="primary"
            size="lg"
            width="100%"
            isLoading={command.pending}
          />
          <p className="text-center text-sm text-slate-500">
            {mode === 'register' ? 'Đã có tài khoản? ' : ''}
            <Link to="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      )}
      {mode === 'verify' && (
        <form onSubmit={resend} className="space-y-4 border-t border-slate-200 pt-5">
          <Field
            label="Chưa nhận được email?"
            name="email"
            type="email"
            placeholder="Email đăng ký"
            required
            maxLength={254}
          />
          <Button type="submit" label="Gửi lại email xác minh" isLoading={command.pending} />
        </form>
      )}
    </AuthLayout>
  )
}
