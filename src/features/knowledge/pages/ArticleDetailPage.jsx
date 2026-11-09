import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Page, Panel } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import MediaImage from '@/shared/components/ui/MediaImage'
import { knowledgeApi } from '../api/knowledge.api'
import { useResource } from '@/shared/hooks/use-resource'
import { api } from '@/shared/api/client'
import { dateTime } from '@/shared/lib/workflows'

function externalUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const load = useCallback(
    async (signal) => {
      const [article, metadata] = await Promise.all([
        knowledgeApi.detail(slug, { signal }),
        api.get('/articles/' + encodeURIComponent(slug) + '/references', { signal, auth: false }),
      ])
      return { ...article, references: metadata.references || [] }
    },
    [slug],
  )
  const resource = useResource(load)
  const article = resource.data
  return (
    <Page title={article?.title || 'Bài viết'} back="/kien-thuc" description={article?.category}>
      <ResourceState {...resource} empty={!article}>
        {article && (
          <article className="mx-auto w-full max-w-3xl">
            <MediaImage
              src={article.coverImageUrl}
              alt={article.title}
              priority
              className="mb-7 aspect-video"
            />
            <Panel>
              <p className="text-xs text-slate-500">Cập nhật {dateTime(article.updatedAt)}</p>
              {article.content.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index} className="text-base leading-9 whitespace-pre-wrap text-slate-700">
                  {paragraph}
                </p>
              ))}
              {article.references.length > 0 && (
                <section className="space-y-3 border-t border-slate-200 pt-5">
                  <h2 className="text-base font-semibold">Nguồn tham khảo</h2>
                  <ul className="space-y-3">
                    {article.references
                      .filter((ref) => externalUrl(ref.url))
                      .map((ref) => (
                        <li key={ref.url}>
                          <a
                            href={externalUrl(ref.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-brand-700 underline underline-offset-4"
                          >
                            {ref.title} ↗
                          </a>
                        </li>
                      ))}
                  </ul>
                  <p className="text-xs leading-6 text-slate-500">
                    Nội dung giới thiệu nguồn đọc, không thay thế đánh giá và tư vấn của người có
                    chuyên môn.
                  </p>
                </section>
              )}
            </Panel>
          </article>
        )}
      </ResourceState>
    </Page>
  )
}
