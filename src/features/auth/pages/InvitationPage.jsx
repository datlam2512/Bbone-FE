import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import { Button } from '@astryxdesign/core/Button'
import PasswordField from '../components/PasswordField'
export default function InvitationPage() {
  const [params] = useSearchParams(),
    [token] = useState(() => params.get('token') || ''),
    [enrollment, setEnrollment] = useState(null),
    [done, setDone] = useState(false),
    [error, setError] = useState(''),
    command = useCommand()
  async function enroll() {
    const result = await command.run(
      () => api.post('/auth/invitations/enroll', { token }, { auth: false }),
      { token },
      'Đã chuẩn bị xác thực hai bước.',
    )
    if (result) setEnrollment(result)
  }
  async function accept(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    if (f.get('password') !== f.get('confirmPassword')) {
      setError('Hai mật khẩu chưa khớp.')
      return
    }
    setError('')
    const body = { token, password: f.get('password'), totpCode: f.get('totpCode') }
    const result = await command.run(
      () => api.post('/auth/invitations/accept', body, { auth: false }),
      body,
      'Đã kích hoạt tài khoản nhân viên.',
    )
    if (result) {
      setDone(true)
      setEnrollment(null)
    }
  }
  return (
    <Page
      title="Kích hoạt tài khoản nhân viên"
      description="Hoàn tất lời mời và xác thực hai bước trước khi truy cập không gian làm việc."
    >
      <Feedback command={command} />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {done ? (
        <Panel title="Tài khoản đã được kích hoạt">
          <p className="text-sm leading-7">
            Đăng nhập bằng email được mời, mật khẩu vừa thiết lập và mã từ ứng dụng xác thực. Nếu
            đang dùng tài khoản khác, hãy đăng xuất trước.
          </p>
          <Link to="/dang-nhap" className="font-semibold text-brand-700">
            Đến trang đăng nhập →
          </Link>
        </Panel>
      ) : !token ? (
        <Panel>
          <p className="text-sm leading-7">
            Vui lòng mở liên kết lời mời trong email. Mã mời có hạn 24 giờ và chỉ sử dụng một lần.
          </p>
        </Panel>
      ) : !enrollment ? (
        <Panel title="1. Thiết lập ứng dụng xác thực">
          <p className="text-sm leading-7">
            Chuẩn bị ứng dụng xác thực TOTP trên điện thoại. QR tiếp theo chứa khóa riêng cho tài
            khoản của bạn.
          </p>
          <Button
            label="Thiết lập xác thực hai bước"
            variant="primary"
            onClick={enroll}
            isLoading={command.pending}
          />
        </Panel>
      ) : (
        <Panel title="2. Quét QR và đặt mật khẩu">
          <section className="grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <img
                src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(enrollment.qrSvg)}
                alt="QR thiết lập ứng dụng xác thực"
                className="w-64 max-w-full rounded-xl border border-slate-200 bg-white p-3"
              />
              <details>
                <summary className="cursor-pointer text-sm text-brand-700">
                  Nhập khóa thủ công thay cho QR
                </summary>
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-sm">
                  {enrollment.secret}
                </p>
              </details>
            </section>
            <form onSubmit={accept} className="space-y-4">
              <PasswordField newPassword minLength={16} />
              <Field
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                required
                minLength={16}
                maxLength={128}
                autoComplete="new-password"
              />
              <Field
                label="Mã xác thực 6 số"
                name="totpCode"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p className="text-xs leading-6 text-slate-500">
                Mật khẩu cần 16–128 ký tự. Không chia sẻ QR, khóa xác thực hoặc mã OTP.
              </p>
              <Submit command={command} label="Kích hoạt tài khoản" />
            </form>
          </section>
        </Panel>
      )}
    </Page>
  )
}
