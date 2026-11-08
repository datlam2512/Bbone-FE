import CollectionPage from '@/shared/components/ui/CollectionPage'
import ClinicCardContent from '../components/ClinicCardContent'
import { clinicsApi } from '../api/clinics.api'
export default function ClinicsPage() {
  return (
    <CollectionPage
      title="Phòng khám"
      description="Tra cứu phòng khám theo tên hoặc địa chỉ."
      load={clinicsApi.list}
      itemKey={(item) => item.clinic.id}
      renderItem={(item) => <ClinicCardContent item={item} />}
    />
  )
}
