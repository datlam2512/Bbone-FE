import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'

const paths = {
  profile: '/me',
  addresses: '/me/addresses',
  notifications: '/me/notifications?size=100',
  favorites: '/me/favorites?size=100',
  records: '/me/encounters?size=100',
}
const titles = {
  profile: 'Thông tin cá nhân',
  addresses: 'Địa chỉ nhận hàng',
  notifications: 'Thông báo',
  favorites: 'Danh sách yêu thích',
  records: 'Hồ sơ khám bệnh',
}
export default function AccountSettingsPage({ mode = 'profile' }) {
  const [editing, setEditing] = useState(null)
  const resource = useResource(
      useCallback(
        async (signal) => {
          const data = await api.get(paths[mode], { signal })
          if (mode !== 'favorites') return data
          return {
            items: await Promise.all(
              itemsOf(data).map(async (f) => {
                try {
                  const target = await api.get(
                    '/' + (f.kind === 'Product' ? 'products/' : 'clinics/') + f.targetId,
                    { signal, auth: false },
                  )
                  return { ...f, target: target.clinic || target }
                } catch {
                  return f
                }
              }),
            ),
          }
        },
        [mode],
      ),
    ),
    command = useCommand(),
    data = resource.data
  async function save(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body =
      mode === 'profile'
        ? {
            name: f.get('name'),
            phone: data.phone,
            dateOfBirth: f.get('dateOfBirth') || null,
            version: data.version,
          }
        : {
            recipient: f.get('recipient'),
            phone: f.get('phone'),
            fullAddress: f.get('fullAddress'),
            isDefault: f.get('isDefault') === 'on',
            version: editing?.version ?? null,
          }
    const ok = await command.run(
      () =>
        mode === 'profile'
          ? api.put('/me', body)
          : editing
            ? api.put('/me/addresses/' + editing.id, body)
            : api.post('/me/addresses', body),
      body,
    )
    if (ok) {
      setEditing(null)
      if (mode === 'profile') {
        const state = useAuthStore.getState()
        state.setUser(await api.get('/me'), state.sessionKey)
      }
      resource.retry()
    }
  }
  async function remove(row) {
    const ok = await command.run(
      () =>
        api.delete(
          '/me/' +
            (mode === 'addresses'
              ? 'addresses/' + row.id + '?version=' + row.version
              : 'favorites/' + row.id),
        ),
      { id: row.id, version: row.version },
    )
    if (ok) resource.retry()
  }
  async function read(row) {
    const ok = await command.run(() => api.post('/me/notifications/' + row.id + '/read'), {
      id: row.id,
    })
    if (ok) resource.retry()
  }
  return (
    <Page title={titles[mode]} back="/tai-khoan">
      <Feedback command={command} />
      <ResourceState {...resource} empty={false}>
        {data && (
          <>
            {mode === 'profile' && (
              <Panel title="Hồ sơ tài khoản">
                <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Họ và tên"
                    name="name"
                    defaultValue={data.name}
                    required
                    maxLength={100}
                  />
                  <Field
                    label="Ngày sinh"
                    type="date"
                    name="dateOfBirth"
                    defaultValue={data.dateOfBirth || ''}
                  />
                  <Field label="Email" value={data.email} readOnly />
                  <Field label="Điện thoại đã xác minh" value={data.phone || ''} readOnly />
                  <Submit command={command} />
                </form>
                <p className="text-xs leading-6 text-slate-500">
                  Đổi email hoặc số điện thoại cần thực hiện bước xác minh riêng để bảo vệ tài
                  khoản.
                </p>
              </Panel>
            )}
            {mode === 'addresses' && (
              <Panel title={editing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}>
                <form
                  key={editing?.id || 'new'}
                  onSubmit={save}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <Field
                    label="Tên người nhận"
                    name="recipient"
                    defaultValue={editing?.recipient || ''}
                    required
                    maxLength={100}
                  />
                  <Field
                    label="Điện thoại"
                    name="phone"
                    type="tel"
                    defaultValue={editing?.phone || ''}
                    required
                    maxLength={30}
                  />
                  <Field
                    label="Địa chỉ"
                    name="fullAddress"
                    defaultValue={editing?.fullAddress || ''}
                    type="textarea"
                    required
                    maxLength={500}
                  />
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name="isDefault"
                      defaultChecked={editing?.isDefault || false}
                    />
                    Đặt làm mặc định
                  </label>
                  <Submit command={command} label={editing ? 'Lưu địa chỉ' : 'Thêm địa chỉ'} />
                  {editing && (
                    <Button
                      label="Hủy chỉnh sửa"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                    />
                  )}
                </form>
              </Panel>
            )}
            {mode !== 'profile' &&
              itemsOf(data).map((row) => (
                <Panel
                  key={row.id}
                  title={
                    row.recipient ||
                    row.title ||
                    row.target?.name ||
                    (mode === 'records' ? 'Lần khám ngày ' + dateTime(row.createdAt) : 'Mục đã lưu')
                  }
                >
                  <p className="text-sm leading-7 text-slate-600">
                    {row.fullAddress || row.message || row.body || row.phone}
                  </p>
                  {row.isDefault && (
                    <p className="text-xs font-medium text-brand-600">Địa chỉ mặc định</p>
                  )}
                  {mode === 'favorites' && row.target && (
                    <Link
                      to={
                        '/' + (row.kind === 'Product' ? 'san-pham/' : 'phong-kham/') + row.targetId
                      }
                      className="text-sm font-semibold text-brand-600"
                    >
                      Xem chi tiết →
                    </Link>
                  )}
                  {['addresses', 'favorites'].includes(mode) && (
                    <Button
                      label="Bỏ khỏi danh sách"
                      variant="ghost"
                      isDisabled={command.pending}
                      onClick={() => remove(row)}
                    />
                  )}{' '}
                  {mode === 'addresses' && (
                    <Button
                      label="Chỉnh sửa địa chỉ"
                      variant="ghost"
                      onClick={() => setEditing(row)}
                    />
                  )}
                  {mode === 'notifications' && !row.readAt && (
                    <Button
                      label="Đánh dấu đã đọc"
                      isDisabled={command.pending}
                      onClick={() => read(row)}
                    />
                  )}{' '}
                  {mode === 'records' && (
                    <Link
                      to={'/tai-khoan/ho-so/' + row.id}
                      className="text-sm font-semibold text-brand-600"
                    >
                      Xem hồ sơ đã được chia sẻ →
                    </Link>
                  )}
                </Panel>
              ))}
            {mode !== 'profile' && !itemsOf(data).length && (
              <p className="py-7 text-sm text-slate-500">Chưa có nội dung trong mục này.</p>
            )}
          </>
        )}
      </ResourceState>
    </Page>
  )
}
