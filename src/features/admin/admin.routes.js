export const adminRoles = ['Admin', 'Commerce', 'Finance', 'Editor', 'Reviewer']
export const adminRoutes = [
  { path: 'hoan-tien', handle: { title: 'Hoàn tiền', roles: ['Admin', 'Finance'] } },
  { index: true, handle: { title: 'Tổng quan quản trị', roles: adminRoles } },
  { path: 'phong-kham', handle: { title: 'Phòng khám', roles: ['Admin'] } },
  { path: 'dich-vu', handle: { title: 'Dịch vụ', roles: ['Admin'] } },
  { path: 'bao-cao', handle: { title: 'Báo cáo', roles: ['Admin', 'Finance'] } },
  { path: 'nhat-ky', handle: { title: 'Nhật ký', roles: ['Admin'] } },
  { path: 'tac-vu', handle: { title: 'Tác vụ', roles: ['Admin'] } },
  { path: 'cau-hinh', handle: { title: 'Cấu hình', roles: ['Admin'] } },
  { path: 'nguoi-dung', handle: { title: 'Quản lý người dùng', roles: ['Admin'] } },
  { path: 'san-pham', handle: { title: 'Quản lý sản phẩm', roles: ['Admin', 'Commerce'] } },
  {
    path: 'don-hang',
    handle: { title: 'Quản lý đơn hàng', roles: ['Admin', 'Commerce', 'Finance'] },
  },
  { path: 'giao-hang', handle: { title: 'Quản lý giao hàng', roles: ['Admin', 'Commerce'] } },
  {
    path: 'noi-dung',
    handle: { title: 'Quản lý nội dung', roles: ['Admin', 'Editor', 'Reviewer'] },
  },
]
