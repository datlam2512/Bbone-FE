export const vietnamDate = (value = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
export const timeLabel = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
export function bookingRange(date, days = 1) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const from = new Date(date + 'T00:00:00+07:00')
  if (
    !Number.isFinite(from.getTime()) ||
    vietnamDate(from) !== date ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 31
  )
    return null
  return new URLSearchParams({
    from: from.toISOString(),
    to: new Date(from.getTime() + days * 86400000).toISOString(),
  }).toString()
}
