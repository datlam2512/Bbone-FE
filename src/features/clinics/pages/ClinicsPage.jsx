import { MapPin, Building2 } from 'lucide-react'
import CollectionPage from '@/shared/components/ui/CollectionPage'
import { clinicsApi } from '../api/clinics.api'

export default function ClinicsPage() {
  return (
    <CollectionPage
      title="Tìm nơi chăm sóc phù hợp"
      description="Tìm phòng khám theo tên hoặc địa chỉ."
      load={clinicsApi.list}
      itemKey={(item) => item.clinic.id}
      renderItem={({ clinic }) => (
        <>
          <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
            <Building2 size={28} />
          </span>
          <h2 className="mt-5 text-lg font-semibold">{clinic.name}</h2>
          <p className="mt-3 flex gap-2 text-sm leading-7 text-slate-500">
            <MapPin size={17} className="mt-1 shrink-0" />
            {clinic.address}
          </p>
          <p className="mt-3 text-sm text-brand-600">{clinic.phone}</p>
        </>
      )}
    />
  )
}
