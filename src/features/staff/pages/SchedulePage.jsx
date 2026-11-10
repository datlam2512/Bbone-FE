import ClinicClosureForm from '../components/ClinicClosureForm'
// Shared page frame: clinic context, actual slots, then explicit schedule operations.
import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import DataTable from '@/shared/components/ui/DataTable'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { bookingRange, vietnamDate } from '@/features/appointments/lib/booking-time'

const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
export default function SchedulePage() {
  const [clinicId, setClinic] = useState(''),
    [date, setDate] = useState(() => vietnamDate()),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null)
  const command = useCommand(),
    range = bookingRange(date)
  const clinics = useResource(
    useCallback((signal) => api.get('/clinics?size=100', { signal, auth: false }), []),
  )
  const detail = useResource(
    useCallback(
      async (signal) => {
        if (!clinicId) return null
        const [clinic, doctors, planning] = await Promise.all([
          api.get('/clinics/' + clinicId, { signal }),
          api.get('/staff/clinics/' + clinicId + '/doctors', { signal }),
          api.get('/staff/scheduling/clinics/' + clinicId, { signal }),
        ])
        return { ...clinic, doctors, ...planning }
      },
      [clinicId],
    ),
  )
  const slots = useResource(
    useCallback(
      (signal) =>
        clinicId && range
          ? api.get(
              '/staff/slots?clinicId=' + clinicId + '&' + range + '&page=' + page + '&size=20',
              { signal },
            )
          : Promise.resolve(null),
      [clinicId, range, page],
    ),
  )
  async function save(event) {
    event.preventDefault()
    const form = event.currentTarget,
      f = new FormData(form)
    const body = {
      serviceId: f.get('serviceId'),
      doctorId: f.get('doctorId'),
      startsAt: new Date(f.get('date') + 'T' + f.get('time') + ':00+07:00').toISOString(),
      capacity: Number(f.get('capacity')),
    }
    const ok = await command.run(() => api.post('/staff/slots', body), body, 'Đã tạo giờ khám.')
    if (ok) {
      slots.retry()
      form.reset()
    }
  }
  async function update(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      body = {
        version: selected.version,
        capacity: Number(f.get('capacity')),
        active: f.get('active') === 'on',
      }
    const ok = await command.run(
      () => api.put('/staff/slots/' + selected.id, body),
      { id: selected.id, ...body },
      'Đã cập nhật giờ khám.',
    )
    if (ok) {
      setSelected(null)
      slots.retry()
    }
  }
  async function recurrence(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      body = {
        serviceId: f.get('serviceId'),
        doctorId: f.get('doctorId'),
        day: f.get('day'),
        from: f.get('from') + ':00',
        to: f.get('to') + ':00',
        timeZoneId: 'Asia/Ho_Chi_Minh',
        capacity: Number(f.get('capacity')),
        active: true,
        version: null,
      }
    const ok = await command.run(
      () => api.post('/staff/scheduling/recurrences', body),
      body,
      'Đã lưu lịch làm việc. Hãy sinh khung giờ để khách có thể đặt.',
    )
    if (ok) detail.retry()
  }
  async function generate(event, id) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      body = { from: f.get('from'), to: f.get('to') }
    await command.run(
      async () => {
        const result = await api.post('/staff/scheduling/recurrences/' + id + '/generate', body)
        return result
      },
      { id, ...body },
      'Đã sinh lịch; giờ trùng, đã qua hoặc cơ sở đóng cửa được bỏ qua.',
    )
    slots.retry()
  }
  function serviceDoctorFields() {
    return (
      <>
        <Field label="Dịch vụ" name="serviceId" type="select" required>
          <option value="">Chọn dịch vụ</option>
          {detail.data?.services.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Field>
        <Field label="Bác sĩ" name="doctorId" type="select" required>
          <option value="">Chọn bác sĩ được phân công</option>
          {detail.data?.doctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Field>
      </>
    )
  }
  return (
    <Page
      title="Quản lý lịch & khung giờ"
      description="Mở giờ khám để khách đặt lịch. Thời gian nhập theo giờ Việt Nam; hệ thống kiểm tra ca trùng và cơ sở đóng cửa."
    >
      <Feedback command={command} />
      <ResourceState {...clinics} empty={!itemsOf(clinics.data).length}>
        <Field
          label="Phòng khám"
          type="select"
          value={clinicId}
          onChange={(event) => {
            setClinic(event.target.value)
            setSelected(null)
            setPage(1)
          }}
        >
          <option value="">Chọn cơ sở</option>
          {itemsOf(clinics.data).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Field>
      </ResourceState>
      {clinicId && (
        <ResourceState {...detail} empty={!detail.data}>
          {detail.data && (
            <>
              {!detail.data.doctors.length && (
                <p
                  role="alert"
                  className="rounded-xl bg-orange-50 p-4 text-sm leading-7 text-orange-900"
                >
                  Cơ sở chưa có bác sĩ được phân công. Quản trị cần cấp quyền cơ sở cho tài khoản
                  Bác sĩ tại mục Người dùng trước khi mở lịch.
                </p>
              )}
              <Panel title="Khung giờ đã mở">
                <Field
                  label="Ngày xem lịch"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value)
                    setPage(1)
                    setSelected(null)
                  }}
                />
                <ResourceState {...slots} empty={false}>
                  {itemsOf(slots.data).length ? (
                    <DataTable
                      rows={itemsOf(slots.data)}
                      page={page}
                      total={slots.data?.total || 0}
                      onPage={setPage}
                      columns={[
                        { label: 'Giờ khám', render: (row) => dateTime(row.startsAt) },
                        {
                          label: 'Dịch vụ',
                          render: (row) =>
                            detail.data.services.find((service) => service.id === row.serviceId)
                              ?.name || 'Dịch vụ không còn hoạt động',
                        },
                        {
                          label: 'Bác sĩ',
                          render: (row) =>
                            detail.data.doctors.find((doctor) => doctor.id === row.doctorId)
                              ?.name || 'Bác sĩ không còn hoạt động',
                        },
                        {
                          label: 'Đã giữ / sức chứa',
                          render: (row) => row.reserved + ' / ' + row.capacity,
                        },
                        {
                          label: 'Trạng thái',
                          render: (row) =>
                            new Date(row.endsAt) < new Date()
                              ? 'Đã qua'
                              : row.active
                                ? 'Đang mở'
                                : 'Đã đóng',
                        },
                        {
                          label: 'Thao tác',
                          render: (row) => (
                            <Button label="Điều chỉnh" size="sm" onClick={() => setSelected(row)} />
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <p className="py-5 text-sm text-slate-500">
                      Chưa có khung giờ trong ngày này. Tạo một giờ khám hoặc sinh từ lịch làm việc
                      bên dưới.
                    </p>
                  )}
                </ResourceState>
                {selected && (
                  <form onSubmit={update} className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="font-semibold">Điều chỉnh {dateTime(selected.startsAt)}</h3>
                    <Field
                      label="Sức chứa"
                      name="capacity"
                      type="number"
                      min={Math.max(1, selected.reserved)}
                      max="100"
                      defaultValue={selected.capacity}
                      required
                    />
                    <label className="flex gap-2 text-sm">
                      <input name="active" type="checkbox" defaultChecked={selected.active} />
                      Mở giờ khám
                    </label>
                    <p className="text-xs leading-6 text-slate-500">
                      Không thể đóng khi còn lịch hẹn hoặc chỗ giữ tạm. Cần xử lý các lịch bị ảnh
                      hưởng trước.
                    </p>
                    <HStack gap={3}>
                      <Submit command={command} />
                      <Button label="Đóng biểu mẫu" onClick={() => setSelected(null)} />
                    </HStack>
                  </form>
                )}
              </Panel>
              <Panel title="Tạo một giờ khám">
                <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                  {serviceDoctorFields()}
                  <Field
                    label="Ngày khám"
                    name="date"
                    type="date"
                    min={vietnamDate()}
                    defaultValue={date}
                    required
                  />
                  <Field label="Giờ bắt đầu" name="time" type="time" required />
                  <Field
                    label="Sức chứa"
                    name="capacity"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="1"
                    required
                  />
                  <Submit command={command} label="Mở giờ khám" />
                </form>
              </Panel>
              <Panel title="Lịch làm việc lặp hàng tuần">
                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-brand-700">
                    Thêm lịch làm việc
                  </summary>
                  <form onSubmit={recurrence} className="mt-4 grid gap-4 sm:grid-cols-2">
                    {serviceDoctorFields()}
                    <Field label="Thứ" name="day" type="select">
                      {[
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ].map((value, index) => (
                        <option key={value} value={value}>
                          {days[index]}
                        </option>
                      ))}
                    </Field>
                    <Field
                      label="Sức chứa mỗi giờ"
                      name="capacity"
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="1"
                      required
                    />
                    <Field label="Từ giờ" name="from" type="time" required />
                    <Field label="Đến giờ" name="to" type="time" required />
                    <Submit command={command} label="Lưu lịch làm việc" />
                  </form>
                </details>
                {detail.data.schedules.map((schedule) => (
                  <section key={schedule.id} className="space-y-3 border-t border-slate-100 py-4">
                    <h3 className="text-sm font-semibold">
                      {detail.data.services.find((item) => item.id === schedule.serviceId)?.name} ·{' '}
                      {detail.data.doctors.find((item) => item.id === schedule.doctorId)?.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {days[
                        [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ].indexOf(schedule.day)
                      ] || schedule.day}{' '}
                      · {schedule.from.slice(0, 5)} – {schedule.to.slice(0, 5)} ·{' '}
                      {schedule.capacity} chỗ / giờ
                    </p>
                    {schedule.active && (
                      <form
                        onSubmit={(event) => generate(event, schedule.id)}
                        className="grid gap-3 sm:grid-cols-3"
                      >
                        <Field
                          label="Sinh từ ngày"
                          name="from"
                          type="date"
                          defaultValue={date}
                          required
                        />
                        <Field
                          label="Đến ngày (tối đa 90 ngày)"
                          name="to"
                          type="date"
                          defaultValue={date}
                          required
                        />
                        <section className="self-end">
                          <Submit command={command} label="Sinh giờ khám" />
                        </section>
                      </form>
                    )}
                  </section>
                ))}
                {!detail.data.schedules.length && (
                  <p className="text-sm text-slate-500">Chưa có lịch làm việc lặp.</p>
                )}
              </Panel>
              <ClinicClosureForm
                key={clinicId}
                clinicId={clinicId}
                onSaved={() => {
                  detail.retry()
                  slots.retry()
                }}
              />
              {detail.data.closures.length > 0 && (
                <Panel title="Thời gian cơ sở đóng cửa">
                  <DataTable
                    rows={detail.data.closures}
                    columns={[
                      { label: 'Từ', render: (row) => dateTime(row.startsAt) },
                      { label: 'Đến', render: (row) => dateTime(row.endsAt) },
                      { label: 'Lý do', key: 'reason' },
                    ]}
                  />
                </Panel>
              )}
            </>
          )}
        </ResourceState>
      )}
    </Page>
  )
}
