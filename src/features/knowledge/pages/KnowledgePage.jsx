import CollectionPage from '@/shared/components/ui/CollectionPage'
import ArticleCardContent from '../components/ArticleCardContent'
import { knowledgeApi } from '../api/knowledge.api'
export default function KnowledgePage() {
  return (
    <CollectionPage
      title="Kiến thức"
      description="Tìm hiểu sức khỏe cơ xương khớp qua các tài liệu từ WHO và NIH."
      load={knowledgeApi.list}
      renderItem={(item) => <ArticleCardContent article={item} />}
    />
  )
}
