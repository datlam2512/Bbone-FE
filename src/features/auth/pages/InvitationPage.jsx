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
      'Đã chuẩn bị kích hoạt tài khoản.',
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
    const body = { token, password: f.get('password') }
    const result = await command.run(
      () => api.post('/auth/invitations/accept', body, { auth: false }),
      body,
      enrollment?.requiresMfa ? 'Đã kích hoạt tài khoản nhân viên.' : 'Đã kích hoạt tài khoản quản trị.',
    )
    if (result) {
      setDone(true)
    }
  }
  return (
    <Page
      title="Kích hoạt tài khoản nhân viên"
      description="Hoàn tất lời mời để truy cập không gian làm việc."
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
            Đăng nhập bằng email được mời và mật khẩu vừa thiết lập{enrollment?.requiresMfa ? ' cùng mã từ ứng dụng xác thực' : ''}. Nếu đang dùng tài khoản khác, hãy đăng xuất trước.
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
        <Panel title="Kích hoạt lời mời">
          <p className="text-sm leading-7">
            Nhấn tiếp tục để hoàn tất kích hoạt lời mời.
          </p>
          <Button
            label="Tiếp tục"
            variant="primary"
            onClick={enroll}
            isLoading={command.pending}
          />
        </Panel>
      ) : (
        <Panel title={enrollment.requiresMfa ? 'Quét QR và đặt mật khẩu' : 'Đặt mật khẩu'}>
          <section className={enrollment.requiresMfa ? 'grid gap-6 md:grid-cols-2' : ''}>
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
              <p className="text-xs leading-6 text-slate-500">
                Mật khẩu cần 16–128 ký tự.
              </p>
              <Submit command={command} label="Kích hoạt tài khoản" />
            </form>
          </section>
        </Panel>
      )}
    </Page>
  )
}
