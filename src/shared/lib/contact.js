export function publicPhone(value) {
  if (typeof value !== 'string') return null
  const digits = value.replace(/\D/g, '')
  return digits.length >= 8 && !/^0+$/.test(digits) ? value.trim() : null
}
