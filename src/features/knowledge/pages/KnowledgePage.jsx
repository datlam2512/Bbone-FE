import CollectionPage from '@/shared/components/ui/CollectionPage'
import ArticleCardContent from '../components/ArticleCardContent'
import { knowledgeApi } from '../api/knowledge.api'
export default function KnowledgePage() {
  return (
    <CollectionPage
      title="Kiến thức"
      description="Hướng dẫn sử dụng các dịch vụ trên BBONE."
      load={knowledgeApi.list}
      renderItem={(item) => <ArticleCardContent article={item} />}
    />
  )
}
