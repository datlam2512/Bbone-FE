import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'

export default function ClinicalPage() {
  const [params] = useSearchParams(),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(1),
    command = useCommand()
  const list = useResource(
    useCallback((signal) => api.get('/staff/encounters?size=20&page=' + page, { signal }), [page]),
  )
  const resource = useResource(
    useCallback(
      (signal) =>
        selected ? api.get('/staff/encounters/' + selected, { signal }) : Promise.resolve(null),
      [selected],
    ),
  )
  async function draft(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = {
        notes: f.get('notes'),
        diagnosis: f.get('diagnosis'),
        prescriptionJson: '[]',
        amendmentOf: null,
        amendmentReason: '',
      }
    const ok = await command.run(
      () => api.post('/staff/encounters/' + selected + '/records', body),
      { encounter: selected, ...body },
      'Đã lưu bản nháp, chưa ký hồ sơ.',
    )
    if (ok) resource.retry()
  }
  async function sign(e, record) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = { version: record.version, published: f.get('published') === 'on' }
    const ok = await command.run(
      () => api.post('/staff/records/' + record.id + '/sign', body),
      { id: record.id, ...body },
      'Đã ký hồ sơ.',
    )
    if (ok) resource.retry()
  }
  return (
    <Page
      title="Hồ sơ & chẩn đoán"
      description="Chỉ bác sĩ được phân công mới có quyền lập và ký hồ sơ. Không tự động tạo nội dung chuyên môn."
    >
      <Feedback command={command} />
      {selected && (
        <Panel title="Chi tiết lần khám">
          <Button label="Đóng hồ sơ" size="sm" onClick={() => setSelected(null)} />
          <ResourceState {...resource} empty={!resource.data}>
            {resource.data && (
              <>
                {resource.data.records.map((record) => (
                  <Panel key={record.id} title={'Ghi nhận ' + dateTime(record.createdAt)}>
                    <Status value={record.signedAt ? 'Đã ký' : 'Bản nháp'} />
                    <p className="text-sm leading-7 whitespace-pre-line">{record.notes}</p>
                    <p className="text-sm leading-7 whitespace-pre-line">
                      Chẩn đoán: {record.diagnosis}
                    </p>
                    {!record.signedAt && (
                      <form onSubmit={(e) => sign(e, record)} className="space-y-4">
                        <label className="flex gap-3 text-sm">
                          <input type="checkbox" name="published" />
                          Chia sẻ hồ sơ đã ký với người bệnh
                        </label>
                        <label className="flex gap-3 text-sm">
                          <input type="checkbox" required />
                          Tôi đã kiểm tra nội dung chuyên môn trước khi ký.
                        </label>
                        <Submit command={command} label="Ký hồ sơ" />
                      </form>
                    )}
                  </Panel>
                ))}
                <form onSubmit={draft} className="space-y-5 border-t border-slate-200 pt-5">
                  <Field
                    label="Ghi chú khám bệnh"
                    name="notes"
                    type="textarea"
                    required
                    maxLength={10000}
                  />
                  <Field
                    label="Chẩn đoán"
                    name="diagnosis"
                    type="textarea"
                    required
                    maxLength={5000}
                  />
                  <p className="text-xs leading-6 text-slate-500">
                    Đơn thuốc chỉ được phát hành qua luồng ký chuyên biệt khi tính năng kê đơn đã
                    được cấu hình.
                  </p>
                  <Submit command={command} label="Lưu hồ sơ nháp" />
                </form>
              </>
            )}
          </ResourceState>
        </Panel>
      )}
      <ResourceState {...list} empty={!itemsOf(list.data).length}>
        <DataTable
          rows={itemsOf(list.data).filter(
            (row) => !params.get('patientId') || row.patientId === params.get('patientId'),
          )}
          page={page}
          total={list.data?.total}
          onPage={setPage}
          columns={[
            { label: 'Ngày tiếp nhận', render: (r) => dateTime(r.createdAt) },
            { label: 'Mã lần khám', render: (r) => r.id.slice(0, 8).toUpperCase() },
            {
              label: 'Hồ sơ',
              render: (r) => (
                <HStack>
                  <Button label="Mở hồ sơ" size="sm" onClick={() => setSelected(r.id)} />
                </HStack>
              ),
            },
          ]}
        />
      </ResourceState>
    </Page>
  )
}
