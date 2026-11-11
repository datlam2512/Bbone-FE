import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
import { bookingRange, timeLabel, vietnamDate } from '../lib/booking-time'

const loadClinics = (signal) => api.get('/clinics?size=100', { signal, auth: false })
export default function BookingPage() {
  const [params] = useSearchParams(),
    user = useAuthStore((s) => s.user)
  const rescheduleId = params.get('rescheduleId')
  const [chosenClinic, setClinic] = useState(params.get('clinicId') || ''),
    [chosenService, setService] = useState(params.get('serviceId') || '')
  const [today] = useState(() => vietnamDate()),
    [date, setDate] = useState(() =>
      bookingRange(params.get('date') || '') && params.get('date') >= vietnamDate()
        ? params.get('date')
        : vietnamDate(),
    )
  const [availabilityStartDate] = useState(date)
  const [chosenSlot, setChosenSlot] = useState(null),
    [restoreSlotId, setRestoreSlotId] = useState(params.get('slotId')),
    [hold, setHold] = useState(null),
    [confirmed, setConfirmed] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const command = useCommand()
  const previous = useResource(
    useCallback(
      (signal) =>
        rescheduleId && user
          ? api.get('/appointments/' + rescheduleId + '/booking-context', { signal })
          : Promise.resolve(null),
      [rescheduleId, user],
    ),
  )
  const clinicId = rescheduleId ? previous.data?.appointment.clinicId || chosenClinic : chosenClinic
  const serviceId = rescheduleId ? previous.data?.serviceId || '' : chosenService
  const clinics = useResource(loadClinics)
  const clinic = useResource(
    useCallback(
      (signal) =>
        clinicId ? api.get('/clinics/' + clinicId, { signal, auth: false }) : Promise.resolve(null),
      [clinicId],
    ),
  )
  const service = clinic.data?.services.find((item) => item.id === serviceId)
  const range = bookingRange(date),
    upcomingRange = bookingRange(availabilityStartDate, 14)
  const availability = useResource(
    useCallback(
      (signal) =>
        serviceId && upcomingRange
          ? api.get('/services/' + serviceId + '/availability?' + upcomingRange, {
              signal,
              auth: false,
            })
          : Promise.resolve([]),
      [serviceId, upcomingRange],
    ),
  )
  const slotsKey = serviceId + ':' + (range || '')
  const slots = useResource(
    useCallback(
      async (signal) => {
        if (!serviceId || !range) return { key: slotsKey, serviceId, rows: [] }
        const endpoint = '/services/' + serviceId + '/slots?size=100&includeFull=true&' + range
        const first = await api.get(endpoint, {
          signal,
          auth: false,
        })
        const rows = [...itemsOf(first)]
        for (let page = 2; rows.length < first.total; page++) {
          const next = itemsOf(
            await api.get(endpoint + '&page=' + page, {
              signal,
              auth: false,
            }),
          )
          if (!next.length) break
          rows.push(...next)
        }
        return { key: slotsKey, serviceId, rows }
      },
      [serviceId, range, slotsKey],
    ),
  )
  const [lastSlots, setLastSlots] = useState(null)
  const currentSlots =
    slots.data?.key === slotsKey
      ? slots.data
      : lastSlots?.serviceId === serviceId
        ? lastSlots
        : null
  const slotsPending = slots.loading || slots.data?.key !== slotsKey
  function changeDate(value) {
    if (currentSlots?.serviceId === serviceId) setLastSlots(currentSlots)
    setDate(value)
    setSlot(null)
  }
  useEffect(() => {
    if (!hold) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hold])
  const remaining = hold
    ? Math.max(0, Math.ceil((new Date(hold.expiresAt).getTime() - now) / 1000))
    : 0
  const upcomingSlots = itemsOf(currentSlots?.rows).filter(
    (item) => item.active !== false && new Date(item.startsAt).getTime() > now,
  )
  const slot =
    chosenSlot ||
    upcomingSlots.find((item) => item.id === restoreSlotId && item.reserved < item.capacity) ||
    null
  function setSlot(value) {
    setRestoreSlotId(null)
    setChosenSlot(value)
  }
  async function reserve() {
    if (!slot || !service) return
    const result = await command.run(
      (key) => api.post('/appointments/holds/' + slot.id, undefined, { idempotencyKey: key }),
      { slotId: slot.id },
      'Đã giữ chỗ. Vui lòng kiểm tra và xác nhận.',
    )
    if (result) {
      setNow(Date.now())
      setHold(result)
    } else {
      setSlot(null)
      slots.retry()
      availability.retry()
    }
  }
  async function changeSlot() {
    const released = await command.run(
      () => api.delete('/appointments/holds/' + hold.id),
      { release: hold.id },
      'Đã trả lại chỗ giữ tạm. Bạn có thể chọn lịch khác.',
    )
    if (released) {
      setHold(null)
      setSlot(null)
      slots.retry()
      availability.retry()
      clinic.retry()
    }
  }
  async function submit(event) {
    event.preventDefault()
    if (!hold || remaining === 0 || !service) return
    const fields = new FormData(event.currentTarget)
    const body = rescheduleId
      ? {
          holdId: hold.id,
          version: previous.data.appointment.version,
          reason: fields.get('reason').trim(),
        }
      : {
          holdId: hold.id,
          patientName: fields.get('patientName').trim(),
          phone: fields.get('phone').trim(),
          note: fields.get('note').trim(),
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
      rescheduleId ? 'Đã đổi lịch khám.' : 'Đặt lịch thành công.',
    )
    if (result) setConfirmed(result)
  }
  if (confirmed)
    return (
      <Page
        title={rescheduleId ? 'Đổi lịch thành công' : 'Đặt lịch thành công'}
        description="Lịch hẹn đã được lưu trong tài khoản của bạn."
      >
        <Panel>
          <CheckCircle2 size={40} className="text-emerald-600" />
          <Status value={confirmed.status} />
          <h2 className="text-xl font-bold">{confirmed.code}</h2>
          <p className="font-semibold">{confirmed.serviceName}</p>
          <p>
            {dateTime(confirmed.startsAt)} – {timeLabel(confirmed.endsAt)}
          </p>
          <p className="text-sm text-slate-500">{confirmed.clinicAddress}</p>
          <p className="text-sm leading-7 text-slate-600">
            Bạn có thể đổi hoặc hủy trước hạn {dateTime(confirmed.cancellationDeadline)} theo chính
            sách lịch hẹn.
          </p>
          <Link to={'/tai-khoan/lich-hen/' + confirmed.id} className="font-semibold text-brand-700">
            Xem chi tiết lịch hẹn →
          </Link>
        </Panel>
      </Page>
    )
  return (
    <Page
      title={rescheduleId ? 'Đổi lịch khám' : 'Đặt lịch khám'}
      description="Chọn nơi khám và giờ còn trống, sau đó xác nhận thông tin. Tất cả thời gian hiển thị theo giờ Việt Nam."
    >
      <ol className="grid gap-3 sm:grid-cols-3">
        {['Chọn nơi & giờ khám', 'Thông tin người khám', 'Xác nhận lịch hẹn'].map(
          (label, index) => (
            <li
              key={label}
              aria-current={index === (hold ? 1 : 0) ? 'step' : undefined}
              className={
                'flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold ' +
                (index === (hold ? 1 : 0)
                  ? 'border-brand-200 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500')
              }
            >
              <p className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs">
                {index + 1}
              </p>
              {label}
            </li>
          ),
        )}
      </ol>
      <Feedback command={command} />
      {rescheduleId && (
        <ResourceState {...previous} empty={!previous.data}>
          {previous.data && (
            <p className="rounded-xl bg-brand-50 p-4 text-sm leading-7 text-brand-900">
              Đổi lịch {previous.data.appointment.code}. Giữ nguyên cơ sở và dịch vụ; lịch cũ chỉ
              thay đổi sau khi bạn xác nhận giờ mới.
            </p>
          )}
        </ResourceState>
      )}
      <section className="grid items-start gap-6 lg:grid-cols-3">
        <VStack gap={5} className="min-w-0 lg:col-span-2">
          {!hold ? (
            <>
              <Panel title="1. Chọn phòng khám & dịch vụ">
                <ResourceState {...clinics} empty={false}>
                  {itemsOf(clinics.data).length === 0 ? (
                    <section className="space-y-2">
                      <p className="text-sm text-slate-700">
                        Bạn có thể liên hệ trực tiếp cơ sở y tế để đặt lịch.
                      </p>
                      <Link
                        to="/phong-kham"
                        className="text-sm font-semibold text-brand-700 hover:underline"
                      >
                        Xem địa chỉ và số điện thoại cơ sở →
                      </Link>
                    </section>
                  ) : (
                    <Field
                      label="Phòng khám"
                      type="select"
                      value={clinicId}
                      disabled={!!rescheduleId}
                      onChange={(event) => {
                        setClinic(event.target.value)
                        setService('')
                        setSlot(null)
                      }}
                    >
                      <option value="">Chọn phòng khám</option>
                      {itemsOf(clinics.data).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Field>
                  )}
                </ResourceState>
                {clinicId && (
                  <ResourceState {...clinic} empty={!clinic.data}>
                    <Field
                      label="Dịch vụ"
                      type="select"
                      value={serviceId}
                      disabled={!!rescheduleId}
                      onChange={(event) => {
                        setService(event.target.value)
                        setSlot(null)
                      }}
                    >
                      <option value="">Chọn dịch vụ</option>
                      {clinic.data?.services.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} · {formatMoney(item.price)}
                        </option>
                      ))}
                    </Field>
                  </ResourceState>
                )}
              </Panel>
              {serviceId && (
                <Panel title="2. Chọn ngày & giờ khám">
                  <Field
                    label="Ngày khám"
                    type="date"
                    value={date}
                    min={today}
                    required
                    onChange={(event) => {
                      changeDate(event.target.value)
                    }}
                  />
                  <ResourceState {...availability} empty={false}>
                    <section className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Ngày còn chỗ trong 14 ngày từ ngày bắt đầu
                      </h3>
                      <HStack gap={2} wrap="wrap">
                        {itemsOf(availability.data).map((day) => {
                          const value = day.date.slice(0, 10)
                          return (
                            <button
                              type="button"
                              key={value}
                              aria-pressed={date === value}
                              onClick={() => changeDate(value)}
                              className={
                                'min-h-14 rounded-xl border px-4 py-2 text-left transition-colors ' +
                                (date === value
                                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                                  : 'border-slate-200 bg-white hover:border-brand-300')
                              }
                            >
                              <p className="text-sm font-semibold">
                                {value.split('-').reverse().slice(0, 2).join('/')}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {day.available} chỗ trống
                              </p>
                            </button>
                          )
                        })}
                      </HStack>
                      {!itemsOf(availability.data).length && (
                        <p className="text-sm leading-7 text-slate-500">
                          Chưa có lịch trống trong khoảng này. Chọn ngày khác hoặc liên hệ để được
                          hỗ trợ.
                        </p>
                      )}
                    </section>
                  </ResourceState>
                  <section className="space-y-4 border-t border-slate-100 pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Clock3 size={17} />
                      Giờ khám ngày {date.split('-').reverse().join('/')}
                    </h3>
                    <section aria-busy={slotsPending}>
                      {slots.error ? (
                        <ResourceState {...slots} empty={false}>
                          {null}
                        </ResourceState>
                      ) : currentSlots ? (
                        <section className="relative">
                          {upcomingSlots.length ? (
                            <section
                              className={
                                'grid gap-3 sm:grid-cols-3 transition-opacity ' +
                                (slotsPending ? 'opacity-60' : '')
                              }
                            >
                              {upcomingSlots.map((item) => {
                                const available = item.capacity - item.reserved
                                const full = available <= 0
                                return (
                                  <button
                                    type="button"
                                    key={item.id}
                                    aria-pressed={slot?.id === item.id}
                                    disabled={slotsPending || full}
                                    onClick={() => setSlot(item)}
                                    className={
                                      'rounded-xl border px-4 py-3 text-left ' +
                                      (full
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-100'
                                        : slot?.id === item.id
                                          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                          : 'border-slate-200 bg-white hover:border-brand-300')
                                    }
                                  >
                                    <p className="text-sm font-bold text-slate-900">
                                      {timeLabel(item.startsAt)} – {timeLabel(item.endsAt)}
                                    </p>
                                    <p
                                      className={
                                        'mt-2 text-xs ' +
                                        (available === 1
                                          ? 'font-semibold text-amber-800'
                                          : 'text-slate-500')
                                      }
                                    >
                                      {full
                                        ? 'Hết chỗ'
                                        : available === 1
                                          ? 'Chỉ còn 1 chỗ'
                                          : `Còn ${available} chỗ`}
                                    </p>
                                  </button>
                                )
                              })}
                            </section>
                          ) : slotsPending ? (
                            <p
                              className="grid min-h-32 place-items-center text-sm text-slate-500"
                              role="status"
                            >
                              Đang tải giờ khám cho ngày mới...
                            </p>
                          ) : (
                            <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
                              <p className="font-semibold">Ngày này chưa có giờ khám còn trống</p>
                              <p className="mt-2 text-sm leading-7 text-slate-500">
                                Chọn một ngày còn chỗ phía trên hoặc đổi ngày khám. Khung giờ do
                                phòng khám mở; hệ thống không tự đặt giờ khi chưa có lịch.
                              </p>
                              <Link
                                to="/lien-he"
                                className="mt-3 inline-flex text-sm font-semibold text-brand-700"
                              >
                                Liên hệ hỗ trợ →
                              </Link>
                            </section>
                          )}
                          {slotsPending && upcomingSlots.length > 0 && (
                            <p className="sr-only" role="status">
                              Đang tải giờ khám cho ngày mới
                            </p>
                          )}
                        </section>
                      ) : (
                        <section
                          className="grid min-h-32 content-center gap-3 sm:grid-cols-3"
                          role="status"
                          aria-label="Đang tải giờ khám"
                        >
                          {[1, 2, 3].map((id) => (
                            <section
                              key={id}
                              className="h-16 animate-pulse rounded-xl border border-slate-100 bg-slate-50 motion-reduce:animate-none"
                            />
                          ))}
                        </section>
                      )}
                    </section>
                  </section>
                </Panel>
              )}
            </>
          ) : (
            <Panel title={rescheduleId ? 'Xác nhận đổi lịch' : 'Thông tin người khám'}>
              <section
                role="status"
                className={
                  'rounded-xl p-4 text-sm leading-7 ' +
                  (remaining ? 'bg-brand-50 text-brand-900' : 'bg-red-50 text-red-700')
                }
              >
                {remaining
                  ? 'Chỗ đang được giữ trong ' +
                    Math.floor(remaining / 60) +
                    ':' +
                    String(remaining % 60).padStart(2, '0') +
                    '. Xác nhận trước khi hết hạn.'
                  : 'Đã hết thời gian giữ chỗ. Vui lòng chọn lại giờ khám.'}
              </section>
              <form onSubmit={submit} className="space-y-5">
                {rescheduleId ? (
                  <>
                    <p className="text-sm leading-7">
                      Người khám: {previous.data?.appointment.patientName} ·{' '}
                      {previous.data?.appointment.phone}
                    </p>
                    <Field
                      label="Lý do đổi lịch"
                      name="reason"
                      type="textarea"
                      required
                      minLength={3}
                      maxLength={1000}
                    />
                  </>
                ) : (
                  <>
                    <section className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Họ và tên người khám"
                        name="patientName"
                        defaultValue={user?.name}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                      <Field
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        defaultValue={user?.phone}
                        required
                        pattern="(?:0|\+84)[0-9 ]{8,13}"
                        maxLength={30}
                      />
                    </section>
                    <Field
                      label="Ghi chú cho phòng khám"
                      name="note"
                      type="textarea"
                      maxLength={1000}
                    />
                  </>
                )}
                <label className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                  <input type="checkbox" required className="mt-2" />
                  Tôi đã kiểm tra người khám, thời gian, cơ sở và chi phí dịch vụ.
                </label>
                <HStack gap={3} wrap="wrap">
                  <Button
                    type="submit"
                    label={rescheduleId ? 'Xác nhận đổi lịch' : 'Xác nhận đặt lịch'}
                    variant="primary"
                    isDisabled={!remaining}
                    isLoading={command.pending}
                  />
                  <Button
                    label="Chọn lại giờ khám"
                    onClick={changeSlot}
                    isDisabled={command.pending}
                  />
                </HStack>
              </form>
            </Panel>
          )}
        </VStack>
        <Panel title="Lịch khám của bạn" className="lg:sticky lg:top-24">
          <CalendarDays size={26} className="text-brand-600" />
          <p className="font-semibold leading-7">
            {clinic.data?.clinic.name || 'Chưa chọn phòng khám'}
          </p>
          <p className="flex items-start gap-2 text-sm leading-7 text-slate-500">
            <MapPin size={16} className="mt-1 shrink-0" />
            {clinic.data?.clinic.address || 'Địa chỉ sẽ hiển thị sau khi chọn cơ sở'}
          </p>
          <p className="border-t border-slate-100 pt-4 text-sm font-semibold">
            {service?.name || 'Chưa chọn dịch vụ'}
          </p>
          <p className="text-sm text-slate-500">
            {service
              ? service.durationMinutes + ' phút / lượt khám'
              : 'Chọn dịch vụ để xem chi phí'}
          </p>
          <p className="min-h-10 text-sm font-medium leading-5">
            {slot ? dateTime(slot.startsAt) + ' – ' + timeLabel(slot.endsAt) : 'Chưa chọn giờ khám'}
          </p>
          {service && (
            <section className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">Chi phí dịch vụ</p>
              <strong className="text-xl text-brand-700">{formatMoney(service.price)}</strong>
            </section>
          )}
          {!hold &&
            (user ? (
              <Button
                label="Tiếp tục"
                icon={<ArrowRight size={17} />}
                variant="primary"
                isDisabled={!slot || !service || (!!rescheduleId && !previous.data)}
                isLoading={command.pending}
                onClick={reserve}
              />
            ) : (
              <Link
                to="/dang-nhap"
                state={{
                  from:
                    '/dat-lich?' +
                    new URLSearchParams({
                      clinicId,
                      serviceId,
                      date,
                      ...(slot ? { slotId: slot.id } : {}),
                      ...(rescheduleId ? { rescheduleId } : {}),
                    }),
                }}
                className="rounded-xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Đăng nhập để đặt lịch
              </Link>
            ))}
          <p className="text-xs leading-6 text-slate-500">
            Chọn giờ chưa đồng nghĩa đặt thành công. Lịch được ghi nhận khi bạn hoàn tất bước xác
            nhận.
          </p>
        </Panel>
      </section>
    </Page>
  )
}
