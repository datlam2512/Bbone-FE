import { publicPhone } from '@/shared/lib/contact'
import FavoriteButton from '@/shared/components/ui/FavoriteButton'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { useResource } from '@/shared/hooks/use-resource'
import { api } from '@/shared/api/client'
import { Page, Panel, Empty } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import MediaImage from '@/shared/components/ui/MediaImage'
import { parseList } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

export default function ClinicDetailPage() {
  const { clinicId } = useParams()
  const load = useCallback(
    async (signal) => {
      const [detail, profile, reviews] = await Promise.all([
        api.get('/clinics/' + clinicId, { signal, auth: false }),
        api.get('/clinics/' + clinicId + '/profile', { signal, auth: false }),
        api.get('/reviews?kind=Clinic&target=' + clinicId, { signal, auth: false }),
      ])
      return { ...detail, profile, reviews }
    },
    [clinicId],
  )
  const resource = useResource(load)
  const data = resource.data
  const clinic = data?.clinic || data
  return (
    <Page
      title={clinic?.name || 'Thông tin phòng khám'}
      back="/phong-kham"
      description={clinic?.address}
    >
      <ResourceState {...resource} empty={!data}>
        {data && (
          <>
            <section className="grid gap-7 lg:grid-cols-3">
              <VStack gap={5} className="lg:col-span-2">
                <MediaImage
                  src={parseList(data.profile?.imagesJson)[0]}
                  alt={clinic.name}
                  priority
                  className="aspect-video"
                />
                <Panel title="Giới thiệu">
                  <p className="text-sm leading-8 whitespace-pre-line text-slate-600">
                    {data.profile?.introduction ||
                      'Liên hệ cơ sở để được tư vấn thông tin chi tiết.'}
                  </p>
                </Panel>
                <Panel title="Dịch vụ">
                  {data.services?.length ? (
                    data.services.map((service) => (
                      <section
                        key={service.id}
                        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0"
                      >
                        <VStack gap={1}>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-slate-500">
                            {service.durationMinutes} phút · {formatMoney(service.price)}
                          </p>
                        </VStack>
                        <Link
                          to={'/dat-lich?clinicId=' + clinicId + '&serviceId=' + service.id}
                          className="text-sm font-semibold text-brand-600"
                        >
                          Chọn dịch vụ →
                        </Link>
                      </section>
                    ))
                  ) : (
                    <Empty text="Chưa có dịch vụ đang mở." />
                  )}
                </Panel>
              </VStack>
              <VStack gap={5}>
                <Panel title="Thông tin cơ sở">
                  <FavoriteButton kind="Clinic" targetId={clinicId} />
                  <p className="text-sm leading-7">{clinic.address}</p>
                  <p className="text-sm text-slate-600">{data.profile?.workingHours}</p>
                  {publicPhone(clinic.phone) && (
                    <a href={'tel:' + clinic.phone} className="font-semibold text-brand-600">
                      {publicPhone(clinic.phone)}
                    </a>
                  )}
                  <Link
                    to={'/dat-lich?clinicId=' + clinicId}
                    className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
                  >
                    Đặt lịch tại đây
                  </Link>
                </Panel>
                <Panel title="Lưu ý đặt lịch">
                  <p className="text-sm leading-7 text-slate-600">
                    {data.profile?.bookingPolicy ||
                      'Vui lòng kiểm tra thông tin trước khi xác nhận.'}
                  </p>
                </Panel>
              </VStack>
            </section>
          </>
        )}
      </ResourceState>
    </Page>
  )
}
