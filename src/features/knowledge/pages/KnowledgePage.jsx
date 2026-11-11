import CollectionPage from '@/shared/components/ui/CollectionPage'
import ArticleCardContent from '../components/ArticleCardContent'
import { knowledgeApi } from '../api/knowledge.api'
export default function KnowledgePage() {
  return (
    <CollectionPage
      title="Kiến thức xương khớp"
      description="Bài viết chuyên đề về cơ, xương và khớp, kèm nguồn y khoa để đọc thêm."
      load={knowledgeApi.list}
      renderItem={(item) => <ArticleCardContent article={item} />}
    />
  )
}
