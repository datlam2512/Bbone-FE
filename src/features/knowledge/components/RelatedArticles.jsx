import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useResource } from '@/shared/hooks/use-resource'
import { itemsOf } from '@/shared/lib/workflows'
import { knowledgeApi } from '../api/knowledge.api'
import ArticleCardContent from './ArticleCardContent'

const limit = 3

export default function RelatedArticles({ article }) {
  const { category, slug } = article
  const load = useCallback(
    async (signal) => {
      const options = { signal }
      const sameTopic = itemsOf(await knowledgeApi.list({ category, size: limit + 1 }, options))
        .filter((item) => item.slug !== slug)
        .slice(0, limit)
      if (sameTopic.length === limit) return sameTopic
      const excluded = new Set([slug, ...sameTopic.map((item) => item.slug)])
      const recent = itemsOf(await knowledgeApi.list({ size: limit + 1 }, options))
      return [...sameTopic, ...recent.filter((item) => !excluded.has(item.slug))].slice(0, limit)
    },
    [category, slug],
  )
  const { data } = useResource(load)
  if (!data?.length) return null

  return (
    <section
      aria-labelledby="related-articles"
      className="mx-auto w-full max-w-5xl space-y-5 border-t border-slate-200 pt-8"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="related-articles" className="text-2xl font-semibold text-ink">
          Bài viết liên quan
        </h2>
        <Link to="/kien-thuc" className="text-sm font-semibold text-brand-700 hover:underline">
          Xem tất cả bài viết →
        </Link>
      </header>
      <ul className="grid gap-4 sm:grid-cols-3">
        {data.map((item) => (
          <li key={item.slug} className="rounded-xl border border-slate-200 bg-white p-4">
            <ArticleCardContent article={item} heading="h3" />
          </li>
        ))}
      </ul>
    </section>
  )
}
