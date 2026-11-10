import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import ResourceState from '@/shared/components/ui/ResourceState'
import JointIllustration from './JointIllustration'
import { bodyRegions } from '../lib/screening-content'
export default function ScreeningQuestions({ flow }) {
  const { questions, questionIndex, answers, command } = flow
  const question = questions[questionIndex]
  const region = bodyRegions.find((item) => item.id === flow.region)
  const lastQuestion = questionIndex === questions.length - 1
  return (
    <section className="grid items-start gap-6 lg:grid-cols-4">
      <VStack
        as="aside"
        gap={4}
        className="rounded-2xl border border-brand-100 bg-white p-5 lg:sticky lg:top-24"
      >
        <figure className="hidden lg:block">
          <JointIllustration region={region.id} large />
        </figure>
        <p className="text-xs text-slate-500">Vùng đang kiểm tra</p>
        <h1 className="text-xl font-bold">{region.label}</h1>
        <Button
          label="Thay đổi vùng"
          icon={<RotateCcw size={15} />}
          onClick={() => flow.setStep(0)}
          isDisabled={command.pending}
        />
        <p className="hidden text-xs leading-6 text-slate-500 lg:block">
          Trả lời theo tình trạng hiện tại. Chọn “Không chắc” nếu bạn chưa xác định được.
        </p>
      </VStack>
      <VStack
        gap={5}
        className="min-w-0 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-8 lg:col-span-3"
      >
        <ResourceState {...flow.definition} empty={!question}>
          {question && (
            <>
              <HStack gap={4} hAlign="between" wrap="wrap">
                <h2 className="text-xl font-bold">Trả lời một số câu hỏi</h2>
                <p className="text-sm text-slate-500">
                  Câu {questionIndex + 1} / {questions.length}
                </p>
              </HStack>
              <ProgressBar
                label="Tiến trình trả lời"
                max={questions.length}
                value={questionIndex + 1}
                isLabelHidden
              />
              <form
                key={question.id}
                onSubmit={(e) => {
                  e.preventDefault()
                  if (lastQuestion) flow.assess()
                  else flow.setQuestionIndex(questionIndex + 1)
                }}
                className="space-y-6"
              >
                <fieldset className="space-y-3" disabled={command.pending}>
                  <legend className="mb-5 text-lg font-semibold leading-8">{question.label}</legend>
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 transition-colors has-checked:border-brand-600 has-checked:bg-brand-50 hover:border-brand-300"
                    >
                      <input
                        type="radio"
                        required
                        name="answer"
                        checked={answers[question.id] === option}
                        onChange={() => flow.setAnswers({ ...answers, [question.id]: option })}
                        className="size-4 shrink-0 accent-brand-600"
                      />
                      {option}
                    </label>
                  ))}
                </fieldset>
                {question.trigger === 'Emergency' && answers[question.id] === 'Có' && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-4 text-sm leading-7 text-red-800"
                  >
                    Triệu chứng này cần được cơ sở cấp cứu đánh giá ngay. Không chờ hoàn thành bảng
                    hỏi.
                  </p>
                )}
                {question.trigger === 'Urgent' && answers[question.id] === 'Có' && (
                  <p
                    role="alert"
                    className="rounded-xl bg-orange-50 p-4 text-sm leading-7 text-orange-800"
                  >
                    Nên liên hệ cơ sở y tế để được đánh giá khẩn trong ngày.
                  </p>
                )}
                {lastQuestion && (
                  <label className="flex gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      required
                      checked={flow.consent}
                      onChange={(e) => flow.setConsent(e.target.checked)}
                      className="mt-1 size-4 shrink-0 accent-brand-600"
                    />
                    Tôi đồng ý xử lý câu trả lời để xem hướng dẫn. Câu trả lời chưa được lưu vào tài
                    khoản.
                  </label>
                )}
                <HStack gap={3} hAlign="between" wrap="wrap">
                  <Button
                    label="Quay lại"
                    icon={<ArrowLeft size={16} />}
                    onClick={() =>
                      questionIndex ? flow.setQuestionIndex(questionIndex - 1) : flow.setStep(0)
                    }
                    isDisabled={command.pending}
                  />
                  <Button
                    type="submit"
                    label={lastQuestion ? 'Xem hướng dẫn' : 'Tiếp tục'}
                    endContent={<ArrowRight size={16} />}
                    variant="primary"
                    isLoading={command.pending}
                    isDisabled={!answers[question.id] || (lastQuestion && !flow.consent)}
                  />
                </HStack>
              </form>
              {question.sourceUrl && (
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-brand-700 underline"
                >
                  Tham khảo hướng dẫn NHS cho câu hỏi này
                </a>
              )}
              <p className="border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
                {flow.definition.data.disclaimer}
              </p>
            </>
          )}
        </ResourceState>
      </VStack>
    </section>
  )
}
