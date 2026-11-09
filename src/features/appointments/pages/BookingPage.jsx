import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import {
  Page,
  Panel,
  Field,
  Feedback,
  Submit,
  Empty,
  Status,
} from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

const loadClinics = (signal) => api.get('/clinics?size=100', { signal, auth: false })
export default function BookingPage() {
  const [params] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const rescheduleId = params.get('rescheduleId')
  const previous = useResource(
    useCallback(
      (signal) =>
        rescheduleId && user
          ? api.get('/appointments/' + rescheduleId, { signal })
          : Promise.resolve(null),
      [rescheduleId, user],
    ),
  )
  const [clinicId, setClinicId] = useState(params.get('clinicId') || '')
  const [serviceId, setServiceId] = useState(params.get('serviceId') || '')
  const [slot, setSlot] = useState(null)
  const [hold, setHold] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }),
  )
  const clinics = useResource(loadClinics)
  const clinic = useResource(
    useCallback(
      (signal) =>
        clinicId ? api.get('/clinics/' + clinicId, { signal, auth: false }) : Promise.resolve(null),
      [clinicId],
    ),
  )
  const slots = useResource(
    useCallback(
      (signal) => {
        if (!serviceId || !date) return Promise.resolve([])
        const from = new Date(date + 'T00:00:00+07:00'),
          to = new Date(from.getTime() + 86400000)
        return api.get(
          '/services/' +
            serviceId +
            '/slots?size=100&from=' +
            encodeURIComponent(from.toISOString()) +
            '&to=' +
            encodeURIComponent(to.toISOString()),
          { signal, auth: false },
        )
      },
      [serviceId, date],
    ),
  )
  const service = clinic.data?.services.find((s) => s.id === serviceId)
  const command = useCommand()
  async function reserve() {
    const result = await command.run(
      (key) => api.post('/appointments/holds/' + slot.id, undefined, { idempotencyKey: key }),
      { slotId: slot.id },
      'Đã giữ chỗ tạm thời. Vui lòng xác nhận trước khi hết hạn.',
    )
    if (result) setHold(result)
  }
  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = rescheduleId
      ? {
          holdId: hold.id,
          version: previous.data.version,
          reason: form.get('reason'),
        }
      : {
          holdId: hold.id,
          patientName: form.get('patientName'),
          phone: form.get('phone'),
          note: form.get('note'),
          acceptedPrice: service.price,
        }
    const result = await command.run(
      (key) =>
        api.post(
          rescheduleId ? '/appointments/' + rescheduleId + '/reschedule' : '/appointments',
          body,
          { idempotencyKey: key },
        ),
      body,
      'Đặt lịch thành công.',
    )
    if (result) setConfirmed(result)
  }
  if (confirmed)
    return (
      <Page
        title="Lịch hẹn đã được xác nhận"
        description="Bạn có thể theo dõi lịch hẹn trong tài khoản."
      >
        <Panel>
          <Status value={confirmed.status} />
          <h2 className="text-xl font-semibold">{confirmed.code}</h2>
          <p>{confirmed.serviceName}</p>
          <p>{dateTime(confirmed.startsAt)}</p>
          <p className="text-sm text-slate-500">{confirmed.clinicAddress}</p>
          <Link to={'/tai-khoan/lich-hen/' + confirmed.id} className="font-semibold text-brand-600">
            Xem lịch hẹn →
          </Link>
        </Panel>
      </Page>
    )
  return (
    <Page
      title="Đặt lịch khám"
      description="Chọn cơ sở, dịch vụ và thời gian phù hợp. Thời gian hiển thị theo giờ Việt Nam."
    >
      <HStack gap={3} wrap="wrap">
        <Status value={hold ? '2 · Thông tin & xác nhận' : '1 · Chọn lịch'} />
        <p className="text-sm text-slate-500">
          {hold
            ? 'Kiểm tra thông tin trước khi xác nhận.'
            : 'Chỉ những khung giờ còn chỗ mới có thể đặt.'}
        </p>
      </HStack>
      <Feedback command={command} />
      {!hold ? (
        <section className="grid gap-6 lg:grid-cols-3">
          <VStack gap={5} className="lg:col-span-2">
            <Panel title="Chọn nơi khám">
              <ResourceState {...clinics} empty={!itemsOf(clinics.data).length}>
                <Field
                  label="Phòng khám"
                  type="select"
                  value={clinicId}
                  onChange={(e) => {
                    setClinicId(e.target.value)
                    setServiceId('')
                    setSlot(null)
                  }}
                >
                  <option value="">Chọn phòng khám</option>
                  {itemsOf(clinics.data).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Field>
              </ResourceState>
              {clinicId && (
                <ResourceState {...clinic} empty={!clinic.data}>
                  <Field
                    label="Dịch vụ"
                    type="select"
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value)
                      setSlot(null)
                    }}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {clinic.data?.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {formatMoney(s.price)}
                      </option>
                    ))}
                  </Field>
                </ResourceState>
              )}
            </Panel>
            {serviceId && (
              <Panel title="Chọn thời gian">
                <Field
                  label="Ngày khám"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setSlot(null)
                  }}
                  required
                />
                <ResourceState {...slots} empty={!itemsOf(slots.data).length}>
                  <HStack gap={3} wrap="wrap">
                    {itemsOf(slots.data)
                      .filter((s) => s.active !== false && s.reserved < s.capacity)
                      .map((s) => (
                        <Button
                          key={s.id}
                          label={new Date(s.startsAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Ho_Chi_Minh',
                          })}
                          variant={slot?.id === s.id ? 'primary' : 'secondary'}
                          onClick={() => setSlot(s)}
                        />
                      ))}
                  </HStack>
                </ResourceState>
              </Panel>
            )}
          </VStack>
          <Panel title="Thông tin lịch khám">
            <p className="text-sm leading-7">
              {clinic.data?.clinic.name || 'Chưa chọn phòng khám'}
            </p>
            <p className="text-sm">{service?.name || 'Chưa chọn dịch vụ'}</p>
            <p className="font-semibold">{service && formatMoney(service.price)}</p>
            <p className="text-sm text-slate-500">
              {slot ? dateTime(slot.startsAt) : 'Chưa chọn giờ khám'}
            </p>
            {user ? (
              <Button
                label="Tiếp tục"
                variant="primary"
                isDisabled={!slot || (!!rescheduleId && !previous.data)}
                isLoading={command.pending}
                onClick={reserve}
              />
            ) : (
              <Link
                to="/dang-nhap"
                state={{ from: '/dat-lich?' + new URLSearchParams({ clinicId, serviceId }) }}
                className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Đăng nhập để đặt lịch
              </Link>
            )}
          </Panel>
        </section>
      ) : (
        <Panel title="Thông tin người khám">
          <p className="text-sm text-slate-500">
            Giữ chỗ đến {dateTime(hold.expiresAt)} · {service?.name} ·{' '}
            {slot && dateTime(slot.startsAt)}
          </p>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Họ và tên"
              name="patientName"
              defaultValue={user?.name}
              required
              maxLength={100}
            />
            <Field
              label="Số điện thoại"
              name="phone"
              type="tel"
              defaultValue={user?.phone}
              required
              maxLength={30}
            />
            <Field label="Ghi chú cho phòng khám" name="note" type="textarea" maxLength={1000} />
            {rescheduleId && (
              <Field
                label="Lý do đổi lịch"
                name="reason"
                type="textarea"
                maxLength={1000}
                required
              />
            )}
            <VStack gap={3} className="justify-end">
              <Submit command={command} label="Xác nhận đặt lịch" />
              <Button
                label="Chọn lại lịch"
                variant="ghost"
                onClick={() => {
                  setHold(null)
                  setSlot(null)
                }}
              />
            </VStack>
          </form>
        </Panel>
      )}
    </Page>
  )
}
