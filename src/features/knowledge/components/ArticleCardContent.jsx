import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import MediaImage from '@/shared/components/ui/MediaImage'

export default function ArticleCardContent({ article, heading: Heading = 'h2' }) {
  return (
    <>
      {article.coverImageUrl ? (
        <MediaImage
          src={article.coverImageUrl}
          alt={'Ảnh minh họa ' + article.title}
          className="mb-5 aspect-[16/10]"
        />
      ) : (
        <figure className="mb-5 grid aspect-[16/10] place-items-center rounded-md bg-brand-50 text-brand-700">
          <BookOpen size={36} aria-hidden="true" />
        </figure>
      )}
      <p className="text-xs font-semibold text-brand-600">{article.category}</p>
      <Heading className="mt-2 text-lg leading-8 font-semibold">
        <Link to={'/kien-thuc/' + article.slug} className="hover:text-brand-600">
          {article.title}
        </Link>
      </Heading>
    </>
  )
}
