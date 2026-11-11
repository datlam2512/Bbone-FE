import InviteStaffForm from '../components/InviteStaffForm'
import AdminDialog from '../components/AdminDialog'
import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf } from '@/shared/lib/workflows'

const roles = [
  'Customer',
  'Admin',
  'Doctor',
  'Receptionist',
  'ClinicManager',
  'Commerce',
  'Finance',
  'Editor',
  'Reviewer',
]
export default function AdminUsersPage() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState(null),
    command = useCommand()
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get('/admin/users?size=20&page=' + page + '&search=' + encodeURIComponent(search), {
          signal,
        }),
      [page, search],
    ),
  )
  const clinics = useResource(
    useCallback((signal) => api.get('/admin/clinics?size=100', { signal }), []),
  )
  const access = useResource(
    useCallback(
      (signal) =>
        selected
          ? api.get('/admin/users/' + selected.id + '/access', { signal })
          : Promise.resolve(null),
      [selected],
    ),
  )
  async function save(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = {
        role: f.get('role'),
        active: f.get('active') === 'on',
        canExport: f.get('canExport') === 'on',
        version: access.data.user.version,
        clinicIds: f.getAll('clinicIds'),
        additionalRoles: f.getAll('additionalRoles'),
      }
    const ok = await command.run(() => api.put('/admin/users/' + selected.id, body), {
      id: selected.id,
      ...body,
    })
    if (ok) {
      setSelected(null)
      resource.retry()
    }
  }
  return (
    <Page
      title="Quản lý người dùng"
      description="Tra cứu tài khoản và phân quyền truy cập theo cơ sở."
    >
      <Feedback command={command} />
      <InviteStaffForm clinics={itemsOf(clinics.data)} onInvited={resource.retry} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(new FormData(e.currentTarget).get('search'))
          setPage(1)
        }}
        className="flex items-end gap-3"
      >
        <Field label="Tên hoặc email" name="search" maxLength={100} />
        <Button type="submit" label="Tìm kiếm" variant="primary" />
      </form>
      {selected && (
        <AdminDialog open={!!selected} onClose={() => setSelected(null)} title={'Phân quyền: ' + selected.name}>
          <Feedback command={command} />
          <ResourceState {...access} empty={!access.data}>
          {access.data && (
            <>
              <p className="text-sm leading-7 text-slate-500">
                Danh sách cơ sở và vai trò phụ bên dưới sẽ thay thế toàn bộ phân công hiện tại. Sau
                khi lưu, các phiên đăng nhập của tài khoản này sẽ được thu hồi.
              </p>
              <form key={selected.id} onSubmit={save} className="space-y-5">
                <Field
                  label="Vai trò chính"
                  name="role"
                  type="select"
                  defaultValue={access.data.user.role}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Field>
                <fieldset className="space-y-3">
                  <legend className="mb-3 text-sm font-semibold">Phân công lại cơ sở</legend>
                  {itemsOf(clinics.data).map((c) => (
                    <label key={c.id} className="flex gap-3 text-sm">
                      <input
                        type="checkbox"
                        name="clinicIds"
                        value={c.id}
                        defaultChecked={access.data.clinicIds.includes(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </fieldset>
                <fieldset className="flex flex-wrap gap-4">
                  <legend className="mb-3 text-sm font-semibold">Vai trò phụ mới</legend>
                  {roles
                    .filter((r) => r !== selected.role)
                    .map((r) => (
                      <label key={r} className="flex gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="additionalRoles"
                          value={r}
                          defaultChecked={access.data.additionalRoles.includes(r)}
                        />
                        {r}
                      </label>
                    ))}
                </fieldset>
                <label className="flex gap-3 text-sm">
                  <input type="checkbox" name="active" defaultChecked={access.data.user.active} />
                  Tài khoản hoạt động
                </label>
                <label className="flex gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="canExport"
                    defaultChecked={access.data.user.canExport}
                  />
                  Cho phép xuất báo cáo
                </label>
                <label className="flex gap-3 text-sm">
                  <input type="checkbox" required />
                  Tôi đã kiểm tra toàn bộ phân quyền mới.
                </label>
                <Submit command={command} label="Lưu phân quyền" />
                <Button label="Đóng" variant="ghost" onClick={() => setSelected(null)} />
              </form>
            </>
          )}
          </ResourceState>
        </AdminDialog>
      )}
      <ResourceState {...resource} empty={!itemsOf(resource.data).length}>
        <DataTable
          rows={itemsOf(resource.data)}
          page={page}
          onPage={setPage}
          total={resource.data?.total}
          columns={[
            { label: 'Họ tên', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Vai trò', key: 'role' },
            {
              label: 'Trạng thái',
              render: (r) => <Status value={r.active ? 'Hoạt động' : 'Đã khóa'} />,
            },
            {
              label: 'Thao tác',
              render: (r) => <Button size="sm" label="Phân quyền" onClick={() => setSelected(r)} />,
            },
          ]}
        />
      </ResourceState>
    </Page>
  )
}
