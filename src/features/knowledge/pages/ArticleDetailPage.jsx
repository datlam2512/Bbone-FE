import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import ResourceState from '@/shared/components/ui/ResourceState'
import MediaImage from '@/shared/components/ui/MediaImage'
import { knowledgeApi } from '../api/knowledge.api'
import { useResource } from '@/shared/hooks/use-resource'
import { api } from '@/shared/api/client'
import { dateTime } from '@/shared/lib/workflows'
import RelatedArticles from '../components/RelatedArticles'

function externalUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

function articleBlocks(content) {
  let section = 0
  return (content || '')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((text) =>
      text.startsWith('## ') ? { text: text.slice(3), id: 'muc-' + ++section } : { text },
    )
}

function citedText(text, references) {
  return text.split(/(\[\d+\])/g).map((part, index) => {
    const match = /^\[(\d+)\]$/.exec(part)
    const number = Number(match?.[1])
    return externalUrl(references[number - 1]?.url) ? (
      <a
        key={index}
        href={'#nguon-' + number}
        aria-label={'Nguồn ' + number}
        className="font-semibold text-brand-700 underline underline-offset-4"
      >
        {part}
      </a>
    ) : (
      part
    )
  })
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
  const article = resource.data?.slug === slug ? resource.data : null
  const blocks = articleBlocks(article?.content)
  const hasIntro = blocks.some((block) => block.id) && !blocks[0].id
  const sections = blocks.filter((block) => block.id)
  const references = article?.references ?? []
  return (
    <VStack as="section" gap={8} className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">
      <nav aria-label="Điều hướng bài viết" className="mx-auto w-full max-w-3xl">
        <Link to="/kien-thuc" className="text-sm font-semibold text-brand-700 hover:underline">
          ← Kiến thức xương khớp
        </Link>
      </nav>
      <ResourceState
        {...resource}
        loading={resource.loading || Boolean(resource.data && !article)}
        empty={!article}
      >
        {article && (
          <article className="mx-auto w-full max-w-3xl space-y-7">
            <header className="space-y-3 border-b border-slate-200 pb-5">
              <p className="text-sm font-semibold text-brand-700">{article.category}</p>
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {article.title}
              </h1>
              <p className="text-sm text-slate-600">Cập nhật {dateTime(article.updatedAt)}</p>
              {hasIntro && (
                <p className="max-w-3xl text-lg leading-8 text-slate-800">
                  {citedText(blocks[0].text, references)}
                </p>
              )}
            </header>
            {article.coverImageUrl && (
              <MediaImage
                src={article.coverImageUrl}
                alt=""
                priority
                className="aspect-video max-w-3xl rounded-xl"
              />
            )}
            {sections.length > 0 && (
              <nav
                aria-label="Mục lục bài viết"
                className="max-w-3xl rounded-xl border border-brand-100 bg-brand-50 p-5"
              >
                <h2 className="font-semibold text-brand-900">Mục lục</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-brand-800">
                  {sections.map(({ id, text }) => (
                    <li key={id}>
                      <a href={'#' + id} className="hover:underline">
                        {text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <section className="max-w-3xl space-y-5">
              {blocks.slice(hasIntro ? 1 : 0).map(({ id, text }, index) =>
                id ? (
                  <h2
                    key={id}
                    id={id}
                    className="scroll-mt-28 pt-4 text-2xl font-semibold text-ink"
                  >
                    {text}
                  </h2>
                ) : (
                  <p key={index} className="text-base leading-9 whitespace-pre-wrap text-slate-700">
                    {citedText(text, references)}
                  </p>
                ),
              )}
              {article.references.length > 0 && (
                <section className="space-y-3 border-t border-slate-200 pt-5">
                  <h2 className="text-base font-semibold">Nguồn tham khảo</h2>
                  <ol className="list-decimal space-y-3 pl-5">
                    {references.map(
                      (ref, index) =>
                        externalUrl(ref.url) && (
                          <li
                            key={index}
                            id={'nguon-' + (index + 1)}
                            value={index + 1}
                            className="scroll-mt-28"
                          >
                            <a
                              href={externalUrl(ref.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-brand-700 underline underline-offset-4"
                            >
                              {ref.title} ↗
                            </a>
                          </li>
                        ),
                    )}
                  </ol>
                  <p className="text-xs leading-6 text-slate-500">
                    Nội dung giới thiệu nguồn đọc, không thay thế đánh giá và tư vấn của người có
                    chuyên môn.
                  </p>
                </section>
              )}
            </section>
          </article>
        )}
      </ResourceState>
      {article && <RelatedArticles key={article.slug} article={article} />}
    </VStack>
  )
}
