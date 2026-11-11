import ImageUploadField from '../components/ImageUploadField'
import MediaImage from '@/shared/components/ui/MediaImage'
import RevisionInbox from '../components/RevisionInbox'
import { useCallback, useState } from 'react'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import DataTable from '@/shared/components/ui/DataTable'
import { itemsOf } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
import { queryString } from '@/shared/api/query-string'

const configs = {
  products: {
    title: 'Quản lý sản phẩm',
    fields: [
      ['sku', 'Mã SKU'],
      ['name', 'Tên sản phẩm'],
      ['brand', 'Thương hiệu'],
      ['category', 'Danh mục'],
      ['price', 'Giá bán', 'number'],
      ['imageUrl', 'Ảnh sản phẩm', 'image'],
      ['description', 'Mô tả', 'textarea'],
      ['active', 'Đang kinh doanh', 'checkbox'],
      ['published', 'Công khai', 'checkbox'],
    ],
  },
  articles: {
    title: 'Quản lý nội dung',
    fields: [
      ['title', 'Tiêu đề'],
      ['slug', 'Đường dẫn bài viết'],
      ['category', 'Chuyên mục'],
      ['coverImageUrl', 'Ảnh bìa bài viết', 'image'],
      ['content', 'Nội dung văn bản / Markdown', 'textarea'],
      ['requiresMedicalReview', 'Cần duyệt chuyên môn', 'checkbox'],
    ],
  },
  clinics: {
    title: 'Quản lý phòng khám',
    fields: [
      ['imageUrl', 'Ảnh đại diện cơ sở', 'image'],
      ['name', 'Tên cơ sở'],
      ['address', 'Địa chỉ'],
      ['phone', 'Điện thoại'],
      ['latitude', 'Vĩ độ', 'number'],
      ['longitude', 'Kinh độ', 'number'],
      ['active', 'Đang hoạt động', 'checkbox'],
    ],
  },
  services: {
    title: 'Quản lý dịch vụ',
    fields: [
      ['name', 'Tên dịch vụ'],
      ['price', 'Giá dịch vụ', 'number'],
      ['durationMinutes', 'Thời lượng (phút)', 'number'],
      ['active', 'Đang hoạt động', 'checkbox'],
    ],
  },
}
export default function AdminCatalogPage({ kind = 'products' }) {
  const includeDirectory = kind === 'products' || kind === 'clinics'
  const pageSize = includeDirectory ? 10 : 20
  const [uploading, setUploading] = useState(false)
  const config = configs[kind],
    role = useAuthStore((s) => s.user?.role),
    [page, setPage] = useState(1),
    [productCategory, setProductCategory] = useState(''),
    [selected, setSelected] = useState(null),
    [clinicId, setClinicId] = useState(''),
    [revision, setRevision] = useState(null)
  const clinics = useResource(
    useCallback(
      (signal) =>
        kind === 'services'
          ? api.get('/clinics?size=100', { signal, auth: false })
          : Promise.resolve([]),
      [kind],
    ),
  )
  const requestPage = kind === 'products' ? 1 : page
  const resource = useResource(
      useCallback(
        async (signal) => {
          if (kind === 'services' && !clinicId) return { items: [], total: 0 }
          const filters = {
            page: requestPage,
            size: kind === 'products' ? 100 : pageSize,
            includeDirectory: includeDirectory || undefined,
            clinicId: kind === 'services' ? clinicId : undefined,
          }
          if (kind === 'products') return loadAllProducts(filters, signal)
          return api.get('/admin/' + kind + queryString(filters), { signal })
        },
        [kind, requestPage, pageSize, includeDirectory, clinicId],
      ),
    ),
    command = useCommand()
  const allProducts = kind === 'products' ? itemsOf(resource.data) : []
  const categories =
    kind === 'products'
      ? [...new Set(allProducts.map((product) => product.category).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, 'vi'),
        )
      : []
  const editCategories = [...new Set([...categories, selected?.category].filter(Boolean))]
  const filteredProducts = productCategory
    ? allProducts.filter((product) => product.category === productCategory)
    : allProducts
  const productRows =
    kind === 'products'
      ? filteredProducts.slice((page - 1) * pageSize, page * pageSize)
      : itemsOf(resource.data)
  const productTotal = kind === 'products' ? filteredProducts.length : resource.data?.total
  async function save(e) {
    e.preventDefault()
    if (uploading) return
    const f = new FormData(e.currentTarget),
      body = { version: selected.id ? selected.version : null }
    for (const [name, , type] of config.fields)
      body[name] =
        type === 'checkbox'
          ? f.get(name) === 'on'
          : type === 'number'
            ? Number(f.get(name))
            : f.get(name) || ''
    if (kind === 'clinics') body.profileVersion = selected.profileVersion || null
    if (kind === 'services') body.clinicId = selected.clinicId || clinicId
    const ok = await command.run(
      async () => {
        if (selected.id && kind === 'articles' && selected.published) {
          const references = await api.get(
            '/articles/' + encodeURIComponent(selected.slug) + '/references',
            { auth: false },
          )
          return api.post('/admin/articles/' + selected.id + '/revisions', {
            baseVersion: selected.version,
            title: body.title,
            content: body.content,
            coverImageUrl: body.coverImageUrl,
            references: references.references || references,
          })
        }
        return selected.id
          ? api.put('/admin/' + kind + '/' + selected.id, body)
          : api.post('/admin/' + kind, body)
      },
      body,
      'Đã lưu ' + (kind === 'articles' ? 'bản nháp.' : 'thay đổi.'),
    )
    if (ok) {
      if (kind === 'articles' && selected.published) setRevision(ok)
      setSelected(null)
      resource.retry()
    }
  }
  async function publish(row) {
    const body = { version: row.version, published: !row.published }
    const ok = await command.run(() => api.post('/admin/articles/' + row.id + '/publish', body), {
      id: row.id,
      ...body,
    })
    if (ok) resource.retry()
  }
  async function stock(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = { delta: Number(f.get('delta')), reason: f.get('reason'), version: selected.version }
    const ok = await command.run(
      (key) => api.post('/admin/products/' + selected.id + '/stock', body, { idempotencyKey: key }),
      { id: selected.id, ...body },
      'Đã điều chỉnh tồn kho.',
    )
    if (ok) {
      if (kind === 'articles' && selected.published) setRevision(ok)
      setSelected(null)
      resource.retry()
    }
  }
  return (
    <Page
      title={config.title}
      description="Quản lý danh mục, kiểm tra thông tin trước khi lưu và công bố."
      actions={
        <Button
          label="Thêm mới"
          variant="primary"
          isDisabled={role === 'Reviewer' || (kind === 'services' && !clinicId)}
          onClick={() => setSelected({})}
        />
      }
    >
      <Feedback command={command} />
      {kind === 'articles' && (
        <RevisionInbox key={revision?.id || 'inbox'} onPublished={resource.retry} />
      )}
      {revision && (
        <Panel title="Đã tạo bản cập nhật chờ duyệt">
          <p className="text-sm">Mã bản cập nhật: {revision.id}</p>
          <p className="text-sm text-slate-500">
            Bản sửa đã có trong danh sách chờ duyệt ở trên. Người duyệt độc lập sẽ đọc nội dung
            trước khi quyết định.
          </p>
        </Panel>
      )}
      {kind === 'services' && (
        <Field
          label="Cơ sở"
          type="select"
          value={clinicId}
          onChange={(e) => {
            setClinicId(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Chọn cơ sở</option>
          {itemsOf(clinics.data).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
      )}
      {kind === 'products' && (
        <Field
          label="Danh mục sản phẩm"
          type="select"
          value={productCategory}
          onChange={(event) => {
            setProductCategory(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Field>
      )}
      {selected && (
        <Panel
          title={selected.stock ? 'Điều chỉnh tồn kho' : selected.id ? 'Chỉnh sửa' : 'Thêm mới'}
        >
          <form
            key={(selected.id || 'new') + (selected.stock ? 'stock' : '')}
            onSubmit={selected.stock ? stock : save}
            className="grid gap-5 sm:grid-cols-2"
          >
            {selected.stock ? (
              <>
                <Field label="Số lượng tăng / giảm" name="delta" type="number" step="1" required />
                <Field label="Lý do điều chỉnh" name="reason" required maxLength={1000} />
              </>
            ) : (
              config.fields.map(([name, label, type = 'text']) =>
                type === 'image' ? (
                  <ImageUploadField
                    key={name}
                    name={name}
                    label={label}
                    kind={kind}
                    initialUrl={selected[name] || ''}
                    onBusyChange={setUploading}
                  />
                ) : type === 'checkbox' ? (
                  <label key={name} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      name={name}
                      defaultChecked={selected[name] ?? name === 'active'}
                    />
                    {label}
                  </label>
                ) : kind === 'products' && name === 'category' ? (
                  <Field
                    key={name}
                    label={label}
                    name={name}
                    type="select"
                    defaultValue={selected[name] ?? ''}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {editCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Field>
                ) : (
                  <Field
                    key={name}
                    label={label}
                    name={name}
                    type={type}
                    defaultValue={selected[name] ?? ''}
                    required={!['imageUrl', 'coverImageUrl', 'brand', 'description'].includes(name)}
                    min={
                      type === 'number' && name !== 'latitude' && name !== 'longitude'
                        ? 0
                        : undefined
                    }
                    step={type === 'number' ? 'any' : undefined}
                    maxLength={type === 'textarea' ? 100000 : 500}
                  />
                ),
              )
            )}
            <HStack gap={3} wrap="wrap">
              <Button
                type="submit"
                label="Lưu thay đổi"
                variant="primary"
                isLoading={command.pending}
                isDisabled={uploading}
              />
              <Button label="Đóng" onClick={() => setSelected(null)} />
            </HStack>
          </form>
        </Panel>
      )}
      <ResourceState {...resource} empty={!productRows.length}>
        <DataTable
          rows={productRows}
          page={page}
          pageSize={pageSize}
          total={productTotal}
          onPage={setPage}
          columns={[
            ...(kind !== 'services'
              ? [
                  {
                    label: 'Ảnh',
                    render: (row) => (
                      <MediaImage
                        src={row.imageUrl || row.coverImageUrl}
                        alt={row.name || row.title}
                        className="h-14 w-16 rounded-lg object-cover"
                      />
                    ),
                  },
                ]
              : []),
            {
              label: kind === 'articles' ? 'Tiêu đề' : 'Tên',
              render: (r) => <p className="max-w-sm font-medium">{r.name || r.title}</p>,
            },
            {
              label: 'Thông tin',
              render: (r) =>
                (kind === 'products' || kind === 'services') && !r.sourceUrl
                  ? formatMoney(r.price)
                  : r.category || r.address,
            },
            {
              label: 'Trạng thái',
              render: (r) => (
                <Status
                  value={
                    r.sourceUrl
                      ? 'Tham khảo'
                      : kind === 'articles'
                        ? r.published
                          ? 'Đã công bố'
                          : 'Bản nháp'
                        : r.active
                          ? 'Hoạt động'
                          : 'Ngừng hoạt động'
                  }
                />
              ),
            },
            ...(kind === 'products'
              ? [{ label: 'Tồn kho', render: (r) => (r.sourceUrl ? '—' : r.onHand - r.reserved) }]
              : []),
            {
              label: 'Thao tác',
              render: (r) =>
                r.sourceUrl ? (
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    Xem nguồn ↗
                  </a>
                ) : (
                  <HStack gap={2} wrap="wrap">
                    <Button
                      label="Chỉnh sửa"
                      isDisabled={role === 'Reviewer'}
                      size="sm"
                      onClick={() => setSelected(r)}
                    />
                    {kind === 'products' && (
                      <Button
                        label="Tồn kho"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected({ ...r, stock: true })}
                      />
                    )}{' '}
                    {kind === 'articles' && ['Reviewer', 'Doctor'].includes(role) && (
                      <Button
                        label={r.published ? 'Ẩn bài' : 'Công bố'}
                        size="sm"
                        variant="ghost"
                        isDisabled={command.pending}
                        onClick={() => publish(r)}
                      />
                    )}
                  </HStack>
                ),
            },
          ]}
        />
      </ResourceState>
    </Page>
  )
}

async function loadAllProducts(filters, signal) {
  const products = []
  const seen = new Set()
  for (let page = 1; ; page += 1) {
    const result = await api.get('/admin/products' + queryString({ ...filters, page }), {
      signal,
    })
    const batch = Array.isArray(result) ? result : result?.items
    if (!Array.isArray(batch)) {
      throw new TypeError('Danh sách sản phẩm trả về từ máy chủ không hợp lệ.')
    }

    let added = 0
    for (const product of batch) {
      const key = product.id ?? JSON.stringify(product)
      if (!seen.has(key)) {
        seen.add(key)
        products.push(product)
        added += 1
      }
    }

    const hasMore = Number.isFinite(result.totalPages)
      ? page < result.totalPages
      : Number.isFinite(result.total)
        ? products.length < result.total
        : batch.length === filters.size
    if (!hasMore || !batch.length || !added) {
      return { ...result, items: products, total: products.length }
    }
  }
}
