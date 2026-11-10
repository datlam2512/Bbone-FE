// Presentation labels only. Questions, validation and care guidance come from the API.
export const bodyRegions = [
  { id: 'shoulder', label: 'Cổ – Vai – Gáy' },
  { id: 'spine', label: 'Cột sống' },
  { id: 'elbow', label: 'Tay – Khuỷu tay' },
  { id: 'knee', label: 'Đầu gối' },
  { id: 'hip', label: 'Hông' },
  { id: 'ankle', label: 'Cổ chân – Bàn chân' },
  { id: 'wrist', label: 'Bàn tay – Cổ tay' },
]
export const outcomeLabels = {
  Emergency: 'Cần đánh giá cấp cứu ngay',
  Urgent: 'Cần được khám khẩn',
  Appointment: 'Nên trao đổi với bác sĩ',
  Information: 'Hướng dẫn theo dõi triệu chứng',
}
export const steps = ['Chọn vùng cơ thể', 'Trả lời câu hỏi', 'Xem hướng dẫn']
export function answeredCount(questions, answers) {
  return questions.filter((question) => question.options.includes(answers[question.id])).length
}
