import { Link, useParams } from 'react-router-dom'

const content = {
  'cau-hoi': {
    title: 'Câu hỏi thường gặp',
    sections: [
      [
        'Tôi tìm phòng khám ở đâu?',
        'Vào mục Phòng khám để tìm theo tên hoặc địa chỉ và xem thông tin cơ sở.',
      ],
      [
        'Tôi xem lịch hẹn và đơn hàng ở đâu?',
        'Đăng nhập vào tài khoản, sau đó chọn Lịch hẹn hoặc Đơn hàng.',
      ],
      ['Làm sao để được hỗ trợ?', 'Bạn có thể liên hệ theo thông tin ở cuối trang.'],
    ],
  },
  'dieu-khoan': {
    title: 'Điều khoản sử dụng',
    sections: [
      [
        'Thông tin trên website',
        'Thông tin sức khỏe có tính chất tham khảo và không thay thế việc thăm khám, chẩn đoán hoặc tư vấn của bác sĩ.',
      ],
      [
        'Tài khoản của bạn',
        'Giữ riêng thông tin đăng nhập và kiểm tra thông tin cá nhân trước khi thực hiện yêu cầu trên hệ thống.',
      ],
      [
        'Thông tin giao dịch',
        'Kiểm tra thông tin dịch vụ, sản phẩm và số tiền tại bước xác nhận trước khi gửi yêu cầu.',
      ],
    ],
  },
  'quyen-rieng-tu': {
    title: 'Quyền riêng tư',
    sections: [
      [
        'Thông tin tài khoản',
        'Bạn có thể xem thông tin cá nhân trong mục Tài khoản sau khi đăng nhập.',
      ],
      [
        'Thông tin sức khỏe',
        'Chỉ cung cấp những thông tin cần thiết cho yêu cầu của bạn. Không chia sẻ mật khẩu hoặc mã xác thực cho người khác.',
      ],
      [
        'Yêu cầu hỗ trợ',
        'Để hỏi về thông tin cá nhân hoặc yêu cầu liên quan đến dữ liệu, vui lòng sử dụng thông tin liên hệ ở cuối trang.',
      ],
    ],
  },
}

export default function InformationPage() {
  const { slug } = useParams()
  const page = content[slug]
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <Link to="/" className="text-sm text-slate-500 hover:text-brand-600">
        Trang chủ
      </Link>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {page?.title || 'Không tìm thấy nội dung'}
      </h1>
      <div className="mt-9 space-y-8">
        {page?.sections.map(([title, text]) => (
          <section key={title}>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-3 leading-8 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
