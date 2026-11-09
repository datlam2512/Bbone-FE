import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
export default function DataTable({ rows, columns, page = 1, total = 0, onPage }) {
  return (
    <VStack gap={4}>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.label} className="px-5 py-4 font-medium whitespace-nowrap" scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id || row.shipment?.id} className="hover:bg-brand-50/30">
                {columns.map((c) => (
                  <td key={c.label} className="px-5 py-4 align-top">
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {onPage && (
        <HStack gap={3} hAlign="end" wrap="wrap">
          <p className="mr-auto self-center text-xs text-slate-500">
            {total} kết quả · Trang {page}
          </p>
          <Button
            label="Trước"
            size="sm"
            isDisabled={page === 1}
            onClick={() => onPage(page - 1)}
          />
          <Button
            label="Sau"
            size="sm"
            isDisabled={page * 20 >= total}
            onClick={() => onPage(page + 1)}
          />
        </HStack>
      )}
    </VStack>
  )
}
