export const staffRoles = ['Admin', 'ClinicManager', 'Doctor', 'Receptionist']
export const staffRoutes = [
  { path: 'khung-gio', handle: { title: 'Khung giờ', roles: ['Admin', 'ClinicManager'] } },
  { index: true, handle: { title: 'Tổng quan công việc' } },
  { path: 'lich-kham', handle: { title: 'Lịch khám và tiếp đón' } },
  { path: 'ho-so', handle: { title: 'Hồ sơ khám', roles: ['Doctor'] } },
  { path: 'bao-cao', handle: { title: 'Báo cáo', roles: ['Admin', 'ClinicManager'] } },
  { path: 'dat-tai-quay', handle: { title: 'Đặt tại quầy' } },
  { path: 'benh-nhan', handle: { title: 'Danh sách bệnh nhân' } },
]
