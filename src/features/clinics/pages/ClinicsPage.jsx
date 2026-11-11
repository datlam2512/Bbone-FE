import CollectionPage from '@/shared/components/ui/CollectionPage'
import ClinicCardContent from '../components/ClinicCardContent'
import { clinicsApi } from '../api/clinics.api'

const locationFilter = {
  key: 'area',
  label: 'Tỉnh, thành phố',
  allLabel: 'Tất cả khu vực',
  options: ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Khánh Hòa', 'Quảng Ninh'],
}

export default function ClinicsPage() {
  return (
    <CollectionPage
      title="Phòng khám"
      description="Tra cứu phòng khám theo tên hoặc địa chỉ."
      load={clinicsApi.list}
      filter={locationFilter}
      loadReferences={clinicsApi.directory}
      pageSize={10}
      fetchAllPages
      itemKey={(item) => item.clinic.id}
      renderItem={(item) => <ClinicCardContent item={item} />}
    />
  )
}
