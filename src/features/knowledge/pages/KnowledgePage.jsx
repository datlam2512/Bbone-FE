import { BookOpen } from 'lucide-react'
import CollectionPage from '@/shared/components/ui/CollectionPage'
import { knowledgeApi } from '../api/knowledge.api'

export default function KnowledgePage() {
  return (
    <CollectionPage
      title="Kiến thức xương khớp"
      description="Tìm hiểu các nội dung sức khỏe đã được công bố."
      load={knowledgeApi.list}
      renderItem={(article) => (
        <>
          <BookOpen size={28} className="text-brand-600" />
          <p className="mt-5 text-xs font-semibold text-brand-600">{article.category}</p>
          <h2 className="mt-2 text-lg leading-8 font-semibold">{article.title}</h2>
        </>
      )}
    />
  )
}
