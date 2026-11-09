import { Link } from 'react-router-dom'
import MediaImage from '@/shared/components/ui/MediaImage'

export default function ArticleCardContent({ article }) {
  return (
    <>
      <MediaImage
        src={article.coverImageUrl}
        alt={'Ảnh minh họa ' + article.title}
        className="mb-5 aspect-[16/10]"
      />
      <p className="text-xs font-semibold text-brand-600">{article.category}</p>
      <h2 className="mt-2 text-lg leading-8 font-semibold">
        <Link to={'/kien-thuc/' + article.slug} className="hover:text-brand-600">
          {article.title}
        </Link>
      </h2>
    </>
  )
}
