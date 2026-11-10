// Uses the existing administration page frame and dense shared table.
import ImageLibrary from '../components/ImageLibrary'
import { Page } from '@/shared/components/ui/Workflow'
export default function AdminImagesPage() {
  return (
    <Page
      title="Thư viện ảnh"
      description="Dùng lại ảnh đã tải; kiểm tra ảnh đang được sử dụng và lưu trữ ảnh chưa dùng."
    >
      <ImageLibrary />
    </Page>
  )
}
