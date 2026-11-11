import { useState } from 'react'
import { api } from '@/shared/api/client'
import { useCommand } from '@/shared/hooks/use-command'
import { Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import { Button } from '@astryxdesign/core/Button'
import AdminDialog from './AdminDialog'
export default function InviteStaffForm({ clinics, onInvited }) {
  const [open, setOpen] = useState(false),
    command = useCommand()
  async function submit(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      body = {
        email: f.get('email').trim(),
        name: f.get('name').trim(),
        role: f.get('role'),
        clinicIds: f.getAll('clinicIds'),
      }
    const saved = await command.run(
      () => api.post('/admin/staff-invitations', body),
      body,
      'Đã tạo lời mời và đưa email vào hàng đợi. Nhân viên cần xác minh và thiết lập MFA trước khi kích hoạt.',
    )
    if (saved) {
      setOpen(false)
      onInvited()
    }
  }
  return (
    <section className="space-y-4">
      <Button
        label="Mời nhân viên"
        variant="primary"
        onClick={() => setOpen(true)}
      />
      <Feedback command={command} />
      {open && (
        <AdminDialog open={open} onClose={() => setOpen(false)} title="Mời nhân viên mới" size="max-w-3xl">
          <Feedback command={command} />
          <form onSubmit={submit} className="space-y-4">
            <section className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ tên" name="name" required minLength={2} maxLength={100} />
              <Field label="Email nhân viên" name="email" type="email" required maxLength={254} />
              <Field label="Vai trò" name="role" type="select">
                {[
                  'Doctor',
                  'Receptionist',
                  'ClinicManager',
                  'Commerce',
                  'Finance',
                  'Editor',
                  'Reviewer',
                  'Admin',
                ].map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </Field>
            </section>
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-semibold">Cơ sở được phân công</legend>
              {clinics.map((clinic) => (
                <label key={clinic.id} className="flex gap-2 text-sm">
                  <input name="clinicIds" type="checkbox" value={clinic.id} />
                  {clinic.name}
                </label>
              ))}
            </fieldset>
            <p className="text-sm leading-7 text-slate-500">
              Lời mời có hạn 24 giờ. Email chỉ được gửi khi nhà cung cấp email cho phép địa chỉ
              nhận; xem Hàng đợi tác vụ nếu gửi thất bại.
            </p>
            <label className="flex gap-2 text-sm leading-7">
              <input type="checkbox" required />
              Tôi đã kiểm tra email, vai trò và phạm vi cơ sở của người được mời.
            </label>
            <Submit command={command} label="Gửi lời mời" />
          </form>
        </AdminDialog>
      )}
    </section>
  )
}
