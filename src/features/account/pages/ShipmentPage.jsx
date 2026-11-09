import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { Page, Panel, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { dateTime } from '@/shared/lib/workflows'
export default function ShipmentPage() {
  const { id } = useParams(),
    resource = useResource(useCallback((signal) => api.get('/shipments/' + id, { signal }), [id])),
    data = resource.data
  return (
    <Page title="Theo dõi giao hàng" back="/tai-khoan/don-hang">
      <ResourceState {...resource} empty={!data}>
        {data && (
          <Panel title={data.shipment?.trackingCode}>
            <Status value={data.shipment?.status} />
            <p className="text-sm">Dự kiến giao: {dateTime(data.shipment?.eta)}</p>
            <ol className="space-y-6 border-l border-brand-200 pl-6">
              {data.events
                ?.filter((e) => e.applied !== false)
                .map((event) => (
                  <li key={event.id || event.occurredAt + event.after}>
                    <Status value={event.after} />
                    <p className="mt-2 text-xs text-slate-500">{dateTime(event.occurredAt)}</p>
                    <p className="mt-2 text-sm">{event.reason}</p>
                  </li>
                ))}
            </ol>
          </Panel>
        )}
      </ResourceState>
    </Page>
  )
}
