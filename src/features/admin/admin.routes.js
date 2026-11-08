export const adminRoles = ['Admin', 'Commerce', 'Finance', 'Editor', 'Reviewer']
export const adminRoutes = [
  { index: true, handle: { title: 'Tổng quan quản trị', roles: adminRoles } },
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
