import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime, statusLabels } from '@/shared/lib/workflows'

const steps = {
  Confirmed: ['CheckedIn', 'NoShow'],
  CheckedIn: ['InProgress'],
  InProgress: ['Completed'],
}
export default function StaffPage({ mode = 'overview' }) {
  const patients = mode === 'patients',
    role = useAuthStore((s) => s.user?.role),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [selected, setSelected] = useState(null),
    command = useCommand()
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get(
          '/staff/' +
            (patients ? 'patients' : 'appointments') +
            '?page=' +
            page +
            '&size=20&search=' +
            encodeURIComponent(search) +
            (status ? '&status=' + status : ''),
          { signal },
        ),
      [patients, page, search, status],
    ),
  )
  const events = useResource(
    useCallback(
      (signal) =>
        selected && !patients
          ? api.get('/staff/work/appointments/' + selected.id + '/events', { signal })
          : Promise.resolve([]),
      [selected, patients],
    ),
  )
  async function update(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = { status: f.get('status'), version: selected.version, reason: f.get('reason') }
    const ok = await command.run(
      () => api.post('/staff/appointments/' + selected.id + '/status', body),
      { id: selected.id, ...body },
    )
    if (ok) {
      setSelected(null)
      resource.retry()
    }
  }
  async function note(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = {
        version: selected.version,
        note: f.get('note'),
        notifyPatient: f.get('notifyPatient') === 'on',
      }
    const ok = await command.run(
      () => api.post('/staff/work/appointments/' + selected.id + '/notes', body),
      { id: selected.id, ...body },
    )
    if (ok) {
      setSelected(null)
      resource.retry()
    }
  }
  const title = patients
    ? 'Danh sách bệnh nhân'
    : mode === 'overview'
      ? 'Công việc phòng khám'
      : 'Lịch khám & tiếp đón'
  return (
    <Page
      title={title}
      description="Dữ liệu được giới hạn theo cơ sở và phân công của tài khoản."
      actions={
        <HStack gap={3} wrap="wrap">
          <Link to="/nhan-vien/dat-tai-quay" className="text-sm font-semibold text-brand-600">
            Đặt lịch tại quầy →
          </Link>
          {role === 'Doctor' && (
            <Link to="/nhan-vien/ho-so" className="text-sm font-semibold text-brand-600">
              Hồ sơ khám →
            </Link>
          )}
        </HStack>
      }
    >
      <Feedback command={command} />
      {mode === 'overview' && (
        <section className="grid gap-5 sm:grid-cols-3">
          <Panel title="Lịch khám được phân công">
            <p className="text-3xl font-semibold">{resource.data?.total ?? '—'}</p>
            <p className="text-xs text-slate-500">Tổng lịch thuộc phạm vi tài khoản</p>
          </Panel>
          <Panel title="Tiếp đón">
            <Link to="/nhan-vien/lich-kham" className="text-sm font-semibold text-brand-600">
              Xem lịch & cập nhật trạng thái →
            </Link>
          </Panel>
          <Panel title="Bệnh nhân">
            <Link to="/nhan-vien/benh-nhan" className="text-sm font-semibold text-brand-600">
              Tra cứu thông tin liên hệ →
            </Link>
          </Panel>
        </section>
      )}
      {patients ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSearch(new FormData(e.currentTarget).get('search'))
            setPage(1)
          }}
          className="flex items-end gap-3"
        >
          <Field label="Tên hoặc điện thoại" name="search" maxLength={100} />
          <Button type="submit" label="Tìm bệnh nhân" variant="primary" />
        </form>
      ) : (
        <Field
          label="Trạng thái lịch"
          type="select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Tất cả</option>
          {['Confirmed', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled', 'NoShow'].map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </Field>
      )}
      {selected && (
        <Panel title={selected.patientName || selected.name}>
          <HStack hAlign="between" wrap="wrap" gap={4}>
            <p className="text-sm text-slate-500">{selected.phone}</p>
            <Button label="Đóng chi tiết" size="sm" onClick={() => setSelected(null)} />
          </HStack>
          {patients ? (
            <>
              <p className="text-sm">Ngày sinh: {selected.dateOfBirth || 'Chưa cập nhật'}</p>
              {role === 'Doctor' && (
                <Link
                  to={'/nhan-vien/ho-so?patientId=' + selected.id}
                  className="text-sm font-semibold text-brand-600"
                >
                  Tra cứu các lần khám →
                </Link>
              )}
            </>
          ) : (
            <>
              <Status value={selected.status} />
              <p className="text-sm">
                {selected.serviceName} · {dateTime(selected.startsAt)}
              </p>
              {(steps[selected.status] || []).some(
                (s) => role !== 'Receptionist' || !['InProgress', 'Completed'].includes(s),
              ) && (
                <form onSubmit={update} className="space-y-4">
                  <Field label="Trạng thái tiếp theo" type="select" name="status">
                    {steps[selected.status]
                      .filter(
                        (s) => role !== 'Receptionist' || !['InProgress', 'Completed'].includes(s),
                      )
                      .map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                  </Field>
                  <Field label="Lý do cập nhật" name="reason" required maxLength={1000} />
                  <Submit command={command} label="Cập nhật lịch khám" />
                </form>
              )}
              <form onSubmit={note} className="space-y-4 border-t border-slate-200 pt-5">
                <Field
                  label="Ghi chú tiếp đón"
                  name="note"
                  type="textarea"
                  required
                  maxLength={1000}
                />
                <label className="flex gap-3 text-sm">
                  <input type="checkbox" name="notifyPatient" />
                  Thông báo cho khách hàng
                </label>
                <Submit command={command} label="Lưu ghi chú" />
              </form>
              <ResourceState {...events} empty={false}>
                <VStack gap={3}>
                  {itemsOf(events.data).map((event) => (
                    <p
                      key={event.id}
                      className="border-l border-slate-200 pl-4 text-xs leading-6 text-slate-500"
                    >
                      {dateTime(event.createdAt)} · {event.action}
                      <br />
                      {event.reason}
                    </p>
                  ))}
                </VStack>
              </ResourceState>
            </>
          )}
        </Panel>
      )}
      <ResourceState {...resource} empty={!itemsOf(resource.data).length}>
        <DataTable
          rows={itemsOf(resource.data)}
          page={page}
          total={resource.data?.total}
          onPage={setPage}
          columns={
            patients
              ? [
                  { label: 'Họ tên', key: 'name' },
                  { label: 'Điện thoại', key: 'phone' },
                  { label: 'Ngày sinh', key: 'dateOfBirth' },
                  {
                    label: 'Thao tác',
                    render: (r) => (
                      <Button label="Thông tin" size="sm" onClick={() => setSelected(r)} />
                    ),
                  },
                ]
              : [
                  { label: 'Thời gian', render: (r) => dateTime(r.startsAt) },
                  { label: 'Người khám', key: 'patientName' },
                  { label: 'Dịch vụ', key: 'serviceName' },
                  { label: 'Trạng thái', render: (r) => <Status value={r.status} /> },
                  {
                    label: 'Thao tác',
                    render: (r) => (
                      <Button
                        label="Tiếp nhận / Chi tiết"
                        size="sm"
                        onClick={() => setSelected(r)}
                      />
                    ),
                  },
                ]
          }
        />
      </ResourceState>
    </Page>
  )
}
