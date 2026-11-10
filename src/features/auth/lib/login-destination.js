export function loginDestination(role, from) {
  if (
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !/[\\\r\n]/.test(from)
  )
    return from
  if (['Admin', 'Commerce', 'Finance', 'Editor', 'Reviewer'].includes(role)) return '/quan-tri'
  if (['Doctor', 'Receptionist', 'ClinicManager'].includes(role)) return '/nhan-vien'
  return '/tai-khoan'
}
