export const itemsOf = (value) => (Array.isArray(value) ? value : value?.items || [])
export function utcDayRange(from, to) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return null
  const start = new Date(from + 'T00:00:00+07:00'),
    end = new Date(new Date(to + 'T00:00:00+07:00').getTime() + 86400000)
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= start ||
    end - start > 366 * 86400000
  )
    return null
  return new URLSearchParams({ from: start.toISOString(), to: end.toISOString() }).toString()
}
export const dateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(new Date(value))
    : 'Chưa cập nhật'
export const parseList = (value) => {
  try {
    return Array.isArray(value) ? value : JSON.parse(value || '[]')
  } catch {
    return []
  }
}
export const statusLabels = {
  CancellationPending: 'Chờ duyệt hủy',
  NotReady: 'Chưa sẵn sàng',
  Ready: 'Sẵn sàng lấy hàng',
  HandedOver: 'Đã bàn giao',
  Shipped: 'Đã gửi hàng',
  Unpaid: 'Chưa thanh toán',
  Failed: 'Thất bại',
  Confirmed: 'Đã xác nhận',
  PendingConfirmation: 'Chờ người bán xác nhận',
  CheckedIn: 'Đã tiếp đón',
  InProgress: 'Đang khám',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
  NoShow: 'Vắng mặt',
  PendingPayment: 'Chờ thanh toán',
  Processing: 'Đang xử lý',
  Pending: 'Đang chờ',
  Paid: 'Đã thanh toán',
  Refunded: 'Đã hoàn tiền',
  PartiallyRefunded: 'Đã hoàn một phần',
  Requested: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Đã từ chối',
  Succeeded: 'Hoàn tiền thành công',
  ReadyForPickup: 'Chờ lấy hàng',
  PickedUp: 'Đã lấy hàng',
  InTransit: 'Đang vận chuyển',
  OutForDelivery: 'Đang giao',
  Delivered: 'Đã giao',
  DeliveryFailed: 'Giao không thành công',
  Returning: 'Đang hoàn',
  Returned: 'Đã hoàn',
  Created: 'Mới tạo',
}
export function visibleQuestions(questions, answers) {
  const normalized = {}
  return questions.filter((question) => {
    const visible = Object.entries(question.visibleWhen || {}).every(
      ([key, value]) => normalized[key] === value,
    )
    if (visible && answers[question.id]) normalized[question.id] = answers[question.id]
    return visible
  })
}
