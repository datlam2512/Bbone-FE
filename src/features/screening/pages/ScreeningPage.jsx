import { useCallback, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Heart,
  Pill,
  ShieldCheck,
  ShoppingCart,
  Zap,
  CalendarDays,
} from 'lucide-react'
import { api } from '@/shared/api/client'
import { Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { visibleQuestions } from '@/shared/lib/workflows'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const regions = [
  { id: 'shoulder', label: 'Cổ - Vai - Gáy', type: 'shoulder' },
  { id: 'spine', label: 'Cột sống', type: 'spine' },
  { id: 'elbow', label: 'Tay - Khuỷu tay', type: 'elbow' },
  { id: 'knee', label: 'Đầu gối', type: 'knee' },
  { id: 'hip', label: 'Hông', type: 'hip' },
  { id: 'ankle', label: 'Cổ chân - Bàn chân', type: 'ankle' },
]

const steps = ['Chọn vùng cơ thể', 'Trả lời câu hỏi', 'Xem kết quả']

function BodyIllustration() {
  return (
    <figure
      aria-label="Minh họa cơ thể người và các vùng xương khớp"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-3/5 items-end justify-center overflow-hidden lg:flex"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 300 430"
        className="h-full max-h-96 w-full"
        fill="none"
        role="img"
      >
        <defs>
          <linearGradient id="body-shell" x1="140" x2="165" y1="30" y2="410">
            <stop stopColor="var(--color-info-muted)" stopOpacity=".4" />
            <stop offset=".48" stopColor="var(--color-accent)" stopOpacity=".16" />
            <stop offset="1" stopColor="var(--color-accent-muted)" stopOpacity=".35" />
          </linearGradient>
          <radialGradient id="body-joint">
            <stop stopColor="var(--color-warning-muted)" />
            <stop offset=".34" stopColor="var(--color-error)" stopOpacity=".95" />
            <stop offset="1" stopColor="var(--color-error)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="body-bone" x1="80" x2="220" y1="60" y2="390">
            <stop stopColor="var(--color-accent-muted)" stopOpacity=".95" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity=".65" />
          </linearGradient>
        </defs>
        <ellipse cx="153" cy="228" rx="122" ry="192" fill="var(--color-info)" opacity=".1" />
        <path
          d="M136 74c-22 4-36 17-44 38l-22 70c-4 12 13 19 19 7l27-51-9 85 11 13-9 94c-1 13 17 16 21 3l19-76 16 76c3 13 22 10 21-4l-7-93 12-13-9-85 28 51c6 12 23 5 19-7l-22-70c-7-21-22-34-44-38l-18 17-19-17Z"
          fill="url(#body-shell)"
          stroke="var(--color-info)"
          strokeOpacity=".6"
          strokeWidth="2"
        />
        <path
          d="M132 78c-1-12 5-22 19-22s20 10 19 22l-5 15 13 18-8 43-19 15-19-15-8-43 13-18-5-15Zm19 32v110m-24-54h48m-38 0-19 27m33-27 21 27m-34 0-10 89m28-89 12 89m-46-228-12 23-11 38m92-61 12 23 11 38m-104 0 12 26m80-26-12 26"
          stroke="url(#body-bone)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <path
          d="M139 82v24m12 4v56m-13-8 13 9 14-9m-29 65 15 13 14-13m-28 25-11 64m38-64 9 64"
          stroke="var(--color-accent-muted)"
          strokeLinecap="round"
          strokeWidth="3"
          opacity=".9"
        />
        <circle cx="108" cy="132" r="30" fill="url(#body-joint)" />
        <circle cx="193" cy="148" r="26" fill="url(#body-joint)" />
        <circle cx="150" cy="292" r="30" fill="url(#body-joint)" />
        <circle cx="157" cy="378" r="25" fill="url(#body-joint)" />
        <path
          d="M215 96c31 11 54 34 66 64"
          stroke="var(--color-info)"
          strokeWidth="2"
          opacity=".6"
        />
        <path
          d="M216 104c26 12 44 31 54 53"
          stroke="var(--color-info)"
          strokeWidth="1"
          opacity=".45"
        />
      </svg>
    </figure>
  )
}

function JointArtwork({ region, className = '' }) {
  const gradientId = useId().replaceAll(':', '')
  return (
    <figure
      aria-hidden="true"
      className={
        'flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-white ' +
        className
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 280 150"
        className="h-full w-full"
        fill="none"
        role="img"
      >
        <defs>
          <linearGradient id={'joint-bone-' + gradientId} x1="50" x2="230" y1="20" y2="140">
            <stop stopColor="var(--color-accent-muted)" />
            <stop offset=".52" stopColor="var(--color-info)" />
            <stop offset="1" stopColor="var(--color-accent-muted)" />
          </linearGradient>
          <radialGradient id={'joint-glow-' + gradientId}>
            <stop stopColor="var(--color-warning-muted)" />
            <stop offset=".35" stopColor="var(--color-error)" stopOpacity=".96" />
            <stop offset="1" stopColor="var(--color-error)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="140" cy="80" rx="122" ry="64" fill="var(--color-info)" opacity=".15" />
        {region === 'shoulder' && (
          <>
            <path
              d="M77 150V69c5-25 24-39 49-41l15 19 16-19c25 2 44 16 49 41v81H77Z"
              fill={'url(#joint-bone-' + gradientId + ')'}
              opacity=".8"
            />
            <path
              d="M140 47v78m-49-58 49 18 49-18"
              stroke="var(--color-accent-muted)"
              strokeWidth="10"
            />
            <path d="m87 68-34 44m140-44 34 44" stroke="var(--color-info)" strokeWidth="18" />
            <circle cx="92" cy="70" r="36" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'spine' && (
          <>
            <path
              d="M92 150c8-39 10-74 17-102 5-18 17-29 31-29s26 11 31 29c7 28 9 63 17 102H92Z"
              fill={'url(#joint-bone-' + gradientId + ')'}
              opacity=".78"
            />
            <path d="M140 21v118" stroke="var(--color-accent-muted)" strokeWidth="10" />
            {Array.from({ length: 8 }, (_, index) => (
              <rect
                key={index}
                x="130"
                y={31 + index * 14}
                width="20"
                height="9"
                rx="4.5"
                fill="var(--color-accent)"
                opacity=".72"
              />
            ))}
            <circle cx="140" cy="80" r="34" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'wrist' && (
          <>
            <path
              d="m88 150 8-53 20-30 6-43m7 39 5-52m8 51 9-46m1 52 15-38m-82 85 27 15 27-9 23 4 25-15"
              stroke={'url(#joint-bone-' + gradientId + ')'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="13"
            />
            <path d="m93 111 42 13" stroke="var(--color-accent-muted)" strokeWidth="8" />
            <circle cx="111" cy="112" r="32" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'elbow' && (
          <>
            <path
              d="m104 13 27 54-3 18-39 53m87-125-28 55 2 18 39 52"
              stroke={'url(#joint-bone-' + gradientId + ')'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="22"
            />
            <path d="m129 69 21 10m-21 7 22-8" stroke="var(--color-accent-muted)" strokeWidth="9" />
            <circle cx="140" cy="81" r="36" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'knee' && (
          <>
            <path
              d="m118 0 13 51 9 16-23 13-18-15-11-40m94-25-13 51-9 16 23 13 18-15 11-40M99 62l18 15 23-4 23 4 18-15m-82 18-6 69m99-69 6 69"
              stroke={'url(#joint-bone-' + gradientId + ')'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="17"
            />
            <path d="M120 79h39" stroke="var(--color-accent-muted)" strokeWidth="8" />
            <circle cx="140" cy="78" r="37" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'hip' && (
          <>
            <path
              d="M92 22c18-12 33-5 39 10l9 23 9-23c6-15 21-22 39-10l20 24-21 25-16-9-9 37-22 22-22-22-9-37-16 9-21-25 20-24Z"
              fill={'url(#joint-bone-' + gradientId + ')'}
              opacity=".82"
            />
            <path
              d="m140 55-17 42 17 26 17-26-17-42Zm-32 19 18 2m46-2-18 2"
              stroke="var(--color-accent-muted)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <circle cx="107" cy="69" r="31" fill={'url(#joint-glow-' + gradientId + ')'} />
            <circle cx="173" cy="69" r="31" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
        {region === 'ankle' && (
          <>
            <path
              d="m109 0 8 79-16 21 6 17 35 7 29-8 14 13-13 17-51 1-39-16 9-32 19-24m33-75-3 79 21 17"
              stroke={'url(#joint-bone-' + gradientId + ')'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="16"
            />
            <path d="m108 105 27 17 27-8" stroke="var(--color-accent-muted)" strokeWidth="8" />
            <circle cx="134" cy="107" r="34" fill={'url(#joint-glow-' + gradientId + ')'} />
          </>
        )}
      </svg>
    </figure>
  )
}

function ProgressSteps({ currentStep }) {
  return (
    <ol aria-label="Tiến trình kiểm tra" className="grid grid-cols-3">
      {steps.map((label, index) => {
        const complete = index < currentStep
        const current = index === currentStep
        return (
          <li key={label} aria-current={current ? 'step' : undefined} className="relative">
            {index > 0 && (
              <p
                aria-hidden="true"
                className={
                  'absolute top-3 right-1/2 left-0 h-px ' +
                  (index <= currentStep ? 'bg-brand-500' : 'bg-slate-200')
                }
              />
            )}
            {index < steps.length - 1 && (
              <p
                aria-hidden="true"
                className={
                  'absolute top-3 right-0 left-1/2 h-px ' +
                  (complete ? 'bg-brand-500' : 'bg-slate-200')
                }
              />
            )}
            <VStack gap={0} hAlign="center" className="relative text-center">
              <p
                className={
                  'flex size-5 items-center justify-center rounded-full text-xs font-bold ' +
                  (complete || current ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')
                }
              >
                {complete ? <Check aria-hidden="true" size={15} /> : index + 1}
              </p>
              <p
                className={
                  'text-xs font-semibold ' + (current ? 'text-brand-700' : 'text-slate-500')
                }
              >
                {label}
              </p>
            </VStack>
          </li>
        )
      })}
    </ol>
  )
}

function IntroFeatures() {
  return (
    <VStack as="ul" gap={1.5} className="relative z-10 max-w-64">
      {[
        [Zap, 'Nhanh chóng', 'Chỉ 2-3 phút để hoàn thành'],
        [ShieldCheck, 'Đáng tin cậy', 'Dựa trên kiến thức y khoa'],
        [Heart, 'Cá nhân hóa', 'Gợi ý phù hợp với bạn'],
      ].map(([Icon, title, description]) => (
        <li
          key={title}
          className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/65 px-3 py-0.5"
        >
          <p className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-brand-600">
            <Icon aria-hidden="true" size={17} />
          </p>
          <VStack gap={0.5}>
            <p className="text-xs font-bold text-ink">{title}</p>
            <p className="text-xs leading-3 text-slate-500">{description}</p>
          </VStack>
        </li>
      ))}
    </VStack>
  )
}

export default function ScreeningPage() {
  const [region, setRegion] = useState('')
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [consent, setConsent] = useState(false)
  const [saved, setSaved] = useState(false)
  const command = useCommand()
  const user = useAuthStore((state) => state.user)
  const resource = useResource(
    useCallback(
      (signal) =>
        region
          ? api.get('/screening/definitions/' + region, { signal, auth: false })
          : Promise.resolve(null),
      [region],
    ),
  )
  const definition = resource.data
  const questions = visibleQuestions(definition?.questions || [], answers)
  const activeQuestionIndex = Math.min(questionIndex, Math.max(questions.length - 1, 0))
  const currentQuestion = questions[activeQuestionIndex]
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((question) => Boolean(answers[question.id]))
  const isLastQuestion = activeQuestionIndex === questions.length - 1
  const selectedRegion = regions.find((item) => item.id === region)

  async function claim(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      claimToken: result.claimToken,
      consent: form.get('consent') === 'on',
      sharedWithDoctor: form.get('shared') === 'on',
    }
    const ok = await command.run(
      (key) => api.post('/screening/claim', body, { idempotencyKey: key }),
      body,
      'Đã lưu kết quả vào tài khoản.',
    )
    if (ok) setSaved(true)
  }

  async function submit(e) {
    e.preventDefault()
    const body = {
      definitionId: definition.id,
      answers: Object.fromEntries(questions.map((question) => [question.id, answers[question.id]])),
      consent,
      policyVersion: '1.0',
    }
    const response = await command.run(
      () => api.post('/screening/anonymous', body, { auth: false }),
      body,
      'Đã hoàn tất bảng câu hỏi.',
    )
    if (response) {
      setResult(response)
      setCurrentStep(2)
    }
  }

  function chooseRegion(value) {
    setRegion(value)
    setAnswers({})
    setQuestionIndex(0)
    setConsent(false)
  }

  function continueQuestions() {
    if (!definition || resource.loading || resource.error) return
    setCurrentStep(1)
  }

  function resetScreening() {
    setRegion('')
    setAnswers({})
    setResult(null)
    setCurrentStep(0)
    setQuestionIndex(0)
    setConsent(false)
    setSaved(false)
  }

  return (
    <VStack as="section" gap={0} className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-5">
      <VStack
        gap={2}
        className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100/70 p-2 shadow-lg shadow-blue-900/5 sm:p-3 lg:p-3"
      >
        <HStack
          gap={3}
          wrap="wrap"
          hAlign="between"
          vAlign="center"
          className="relative z-10 text-xs text-slate-500"
        >
          <HStack gap={2} wrap="wrap">
            <Link to="/" className="hover:text-brand-700">
              Trang chủ
            </Link>
            <p aria-hidden="true">›</p>
            <p className="font-medium text-ink">Kiểm tra xương khớp</p>
            {currentStep > 0 && (
              <>
                <p aria-hidden="true">›</p>
                <p className="font-medium text-ink">
                  {currentStep === 1 ? 'Câu hỏi đánh giá' : 'Kết quả'}
                </p>
              </>
            )}
          </HStack>
          <section className="w-full sm:w-80 lg:w-96">
            <ProgressSteps currentStep={currentStep} />
          </section>
        </HStack>

        {currentStep > 0 && <Feedback command={command} />}

        {currentStep === 0 && !result && (
          <section className="grid min-h-64 gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-5">
            <VStack gap={4} className="relative justify-between overflow-hidden py-1 sm:py-2">
              <BodyIllustration />
              <VStack gap={3} className="relative z-10 max-w-sm">
                <VStack gap={2.5}>
                  <p className="text-xs font-extrabold tracking-wider text-brand-600">BODY CHECK</p>
                  <h1 className="max-w-xs text-2xl font-bold leading-tight tracking-tight text-ink">
                    Kiểm tra tình trạng xương khớp
                  </h1>
                  <p className="max-w-xs text-xs leading-5 text-slate-600">
                    Đánh giá nhanh các vấn đề xương khớp, nhận gợi ý chăm sóc và hướng xử lý phù
                    hợp.
                  </p>
                </VStack>
                <IntroFeatures />
              </VStack>
            </VStack>

            <VStack
              as="section"
              gap={1.5}
              className="relative z-10 self-center rounded-2xl border border-white bg-white/85 p-2 shadow-lg shadow-blue-900/5 sm:p-3"
            >
              <VStack gap={1.5}>
                <h2 className="text-base font-bold text-ink">
                  Bước 1: Chọn vùng cơ thể đang gặp vấn đề
                </h2>
                <p className="text-xs leading-5 text-slate-500">
                  Nhấn vào vùng cơ thể bạn muốn kiểm tra.
                </p>
              </VStack>
              <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <legend className="sr-only">Chọn vùng cơ thể cần kiểm tra</legend>
                {regions.map(({ id, label, type }) => (
                  <label
                    key={id}
                    className={
                      'relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition ' +
                      (region === id
                        ? 'border-brand-600 ring-1 ring-brand-600'
                        : 'border-slate-200 hover:border-brand-300')
                    }
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="region"
                      value={id}
                      checked={region === id}
                      onChange={() => chooseRegion(id)}
                    />
                    {region === id && (
                      <p className="absolute top-1.5 right-1.5 z-10 flex size-4 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check aria-hidden="true" size={11} />
                      </p>
                    )}
                    <JointArtwork region={type} className="h-10 w-full border-b border-blue-50" />
                    <p className="px-1.5 py-0.5 text-center text-xs font-bold text-ink">{label}</p>
                  </label>
                ))}
              </fieldset>

              {region && resource.error?.code === 'SCREENING_DISABLED' && (
                <VStack gap={2} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <h3 className="text-sm font-bold text-ink">Kiểm tra sức khỏe chưa mở</h3>
                  <p className="text-xs leading-5 text-slate-600">
                    Bảng câu hỏi cần được chuyên môn phê duyệt trước khi sử dụng.
                  </p>
                  <Link to="/phong-kham" className="text-xs font-bold text-brand-700">
                    Tìm phòng khám →
                  </Link>
                </VStack>
              )}
              {region && resource.error?.code !== 'SCREENING_DISABLED' && (
                <ResourceState {...resource} empty={!definition}>
                  {definition && (
                    <p className="text-xs font-medium text-emerald-700">
                      Đã sẵn sàng câu hỏi cho vùng này.
                    </p>
                  )}
                </ResourceState>
              )}
              <Button
                label="Tiếp tục"
                variant="primary"
                size="md"
                width="100%"
                endContent={<ArrowRight aria-hidden="true" size={16} />}
                isDisabled={!region || resource.loading || !definition || Boolean(resource.error)}
                onClick={continueQuestions}
              />
            </VStack>
          </section>
        )}

        {currentStep === 1 && !result && (
          <section className="grid gap-4 lg:grid-cols-[0.72fr_1.6fr]">
            <VStack
              gap={3}
              className="rounded-2xl border border-white bg-white/85 p-3 shadow-sm sm:p-4"
            >
              <JointArtwork
                region={selectedRegion?.type}
                className="h-36 w-full rounded-xl sm:h-40"
              />
              <VStack gap={1}>
                <p className="text-xs text-slate-500">Vùng kiểm tra</p>
                <h2 className="text-lg font-bold text-ink">{selectedRegion?.label}</h2>
              </VStack>
              <Button
                label="Thay đổi vùng"
                variant="secondary"
                size="sm"
                icon={<ArrowLeft aria-hidden="true" size={14} />}
                onClick={() => setCurrentStep(0)}
              />
            </VStack>

            <VStack
              as="section"
              gap={3}
              className="min-h-72 rounded-2xl border border-white bg-white/90 p-4 shadow-sm sm:p-5"
            >
              <HStack gap={3} hAlign="between" vAlign="center">
                <VStack gap={1}>
                  <h2 className="text-base font-bold text-ink">Bước 2: Trả lời một số câu hỏi</h2>
                  <p className="text-xs text-slate-500">
                    Chọn câu trả lời phù hợp nhất với tình trạng của bạn.
                  </p>
                </VStack>
                {currentQuestion && (
                  <p className="shrink-0 text-xs font-semibold text-slate-600">
                    Câu {activeQuestionIndex + 1} / {questions.length}
                  </p>
                )}
              </HStack>

              {!definition || resource.loading || resource.error ? (
                <ResourceState {...resource} empty={!definition}>
                  {resource.error && (
                    <p className="text-xs text-slate-500">{resource.error.message}</p>
                  )}
                </ResourceState>
              ) : !currentQuestion ? (
                <VStack gap={3} className="rounded-xl bg-sky-50 p-4">
                  <p className="text-sm font-semibold text-ink">Chưa có câu hỏi cho vùng này.</p>
                  <Link to="/dat-lich" className="text-xs font-semibold text-brand-700">
                    Đặt lịch tư vấn →
                  </Link>
                </VStack>
              ) : (
                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                  <VStack gap={3} className="flex-1">
                    <progress
                      aria-label="Tiến độ trả lời"
                      className="screening-progress h-1.5 w-full overflow-hidden"
                      value={activeQuestionIndex + 1}
                      max={questions.length}
                    />
                    <fieldset className="space-y-2">
                      <legend className="mb-2 text-sm font-bold leading-5 text-ink">
                        {currentQuestion.label}
                      </legend>
                      {currentQuestion.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-ink transition hover:border-brand-300 has-checked:border-brand-500 has-checked:bg-blue-50"
                        >
                          <input
                            className="accent-brand-600"
                            type="radio"
                            name={currentQuestion.id}
                            value={option}
                            required
                            checked={answers[currentQuestion.id] === option}
                            onChange={() =>
                              setAnswers((previous) => ({
                                ...previous,
                                [currentQuestion.id]: option,
                              }))
                            }
                          />
                          {option}
                        </label>
                      ))}
                    </fieldset>
                    {isLastQuestion && (
                      <VStack gap={2}>
                        <p className="text-xs leading-4 text-slate-500">{definition.disclaimer}</p>
                        <label className="flex items-start gap-2 text-xs leading-4 text-slate-600">
                          <input
                            className="mt-0.5 accent-brand-600"
                            type="checkbox"
                            name="consent"
                            required
                            checked={consent}
                            onChange={(event) => setConsent(event.target.checked)}
                          />
                          <p>
                            Tôi đồng ý xử lý câu trả lời để nhận kết quả tham khảo. Kết quả chưa
                            được lưu vào hồ sơ tài khoản.
                          </p>
                        </label>
                      </VStack>
                    )}
                  </VStack>
                  <HStack gap={3} hAlign="between" className="mt-3 border-t border-slate-100 pt-3">
                    <Button
                      label="Quay lại"
                      variant="secondary"
                      size="sm"
                      icon={<ArrowLeft aria-hidden="true" size={14} />}
                      onClick={() => {
                        if (activeQuestionIndex === 0) setCurrentStep(0)
                        else setQuestionIndex(activeQuestionIndex - 1)
                      }}
                    />
                    {isLastQuestion ? (
                      <Button
                        type="submit"
                        label="Xem kết quả"
                        variant="primary"
                        size="sm"
                        isLoading={command.pending}
                        isDisabled={!consent || !allQuestionsAnswered}
                        endContent={<ArrowRight aria-hidden="true" size={15} />}
                      />
                    ) : (
                      <Button
                        label="Tiếp tục"
                        variant="primary"
                        size="sm"
                        endContent={<ArrowRight aria-hidden="true" size={15} />}
                        isDisabled={!answers[currentQuestion.id]}
                        onClick={() => setQuestionIndex(activeQuestionIndex + 1)}
                      />
                    )}
                  </HStack>
                  {isLastQuestion && (!consent || !allQuestionsAnswered) && (
                    <p className="sr-only">Cần trả lời tất cả câu hỏi và đồng ý để xem kết quả.</p>
                  )}
                </form>
              )}
            </VStack>
          </section>
        )}

        {currentStep === 2 && result && (
          <section className="grid gap-4 lg:grid-cols-[1.65fr_0.7fr]">
            <VStack
              gap={4}
              className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm sm:p-5"
            >
              <HStack gap={4} vAlign="center">
                <figure className="relative flex size-28 shrink-0 items-center justify-center rounded-full border-4 border-sky-100 bg-gradient-to-br from-blue-100 to-sky-50 sm:size-36">
                  <JointArtwork region={selectedRegion?.type} className="size-full rounded-full" />
                  <p className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-500" />
                </figure>
                <VStack gap={2}>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Kết quả đánh giá
                  </p>
                  <h2 className="text-xl font-bold text-ink">{result.level}</h2>
                  <HStack gap={2} vAlign="center" className="rounded-xl bg-amber-50 px-3 py-2">
                    <Activity aria-hidden="true" className="shrink-0 text-amber-600" size={17} />
                    <p className="text-xs font-bold leading-4 text-ink">
                      Đánh giá dựa trên câu trả lời của bạn
                    </p>
                  </HStack>
                </VStack>
              </HStack>
              <p className="text-xs leading-5 text-slate-600">{result.advice}</p>

              {user && !saved && (
                <form onSubmit={claim}>
                  <VStack gap={2} className="rounded-xl border border-slate-200 p-3">
                    <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                      <input
                        className="mt-1 accent-brand-600"
                        type="checkbox"
                        name="consent"
                        required
                      />
                      Tôi đồng ý lưu kết quả vào hồ sơ của mình.
                    </label>
                    <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                      <input className="mt-1 accent-brand-600" type="checkbox" name="shared" />
                      Cho phép chia sẻ kết quả với bác sĩ.
                    </label>
                    <Submit command={command} label="Lưu kết quả" />
                  </VStack>
                </form>
              )}
              {saved && (
                <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                  Kết quả đã được lưu vào tài khoản của bạn.
                </p>
              )}

              <VStack gap={2}>
                <h3 className="text-xs font-bold text-ink">Khuyến nghị cho bạn</h3>
                <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    [Dumbbell, 'Tập bài tập nhẹ nhàng'],
                    [Pill, 'Bổ sung dưỡng chất'],
                    [Heart, 'Giữ tư thế đúng'],
                    [CalendarDays, 'Khám chuyên sâu nếu kéo dài'],
                  ].map(([Icon, label]) => (
                    <VStack
                      as="article"
                      key={label}
                      gap={2}
                      className="items-center rounded-xl border border-blue-100 bg-white p-2 text-center"
                    >
                      <Icon aria-hidden="true" className="text-brand-600" size={19} />
                      <p className="text-xs font-semibold leading-4 text-ink">{label}</p>
                    </VStack>
                  ))}
                </section>
              </VStack>
              <p className="border-t border-slate-100 pt-2 text-xs leading-4 text-slate-500">
                Kết quả chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ.
              </p>
            </VStack>

            <VStack
              gap={3}
              className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm sm:p-5"
            >
              <h2 className="text-base font-bold text-ink">Bước tiếp theo</h2>
              <Link
                to="/dat-lich"
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-brand-600 p-3 text-white shadow-sm transition hover:brightness-105"
              >
                <CalendarDays aria-hidden="true" size={19} />
                <VStack gap={0.5} className="flex-1">
                  <p className="text-xs font-bold text-white">Đặt lịch khám</p>
                  <p className="text-xs text-blue-100">Tại phòng khám gần bạn</p>
                </VStack>
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
              <Link
                to="/san-pham"
                className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 transition hover:border-brand-300"
              >
                <ShoppingCart aria-hidden="true" className="text-brand-600" size={19} />
                <VStack gap={0.5} className="flex-1">
                  <p className="text-xs font-bold text-ink">Sản phẩm hỗ trợ</p>
                  <p className="text-xs text-slate-500">Giảm đau, bảo vệ khớp</p>
                </VStack>
                <ArrowRight aria-hidden="true" className="text-brand-600" size={15} />
              </Link>
              <Button
                label="Kiểm tra lại"
                variant="secondary"
                size="sm"
                icon={<ArrowLeft aria-hidden="true" size={14} />}
                onClick={resetScreening}
              />
            </VStack>
          </section>
        )}
      </VStack>
    </VStack>
  )
}
