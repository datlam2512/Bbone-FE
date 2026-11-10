import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { Feedback } from '@/shared/components/ui/Workflow'
import ScreeningStepper from '../components/ScreeningStepper'
import RegionSelection from '../components/RegionSelection'
import ScreeningQuestions from '../components/ScreeningQuestions'
import ScreeningResult from '../components/ScreeningResult'
import { useScreening } from '../hooks/use-screening'

// Page composition only. API calls and transitions live in useScreening.
export default function ScreeningPage() {
  const flow = useScreening()
  const pageRef = useRef(null)
  useEffect(() => {
    pageRef.current?.focus({ preventScroll: true })
    pageRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [flow.step, flow.questionIndex])
  return (
    <VStack
      as="section"
      ref={pageRef}
      tabIndex={-1}
      gap={5}
      className="scroll-mt-24 outline-none bg-gradient-to-b from-brand-50 to-white px-4 py-7 sm:px-6 lg:py-10"
    >
      <VStack gap={5} className="mx-auto w-full max-w-6xl">
        <nav aria-label="Đường dẫn" className="text-xs text-slate-600">
          <Link to="/" className="hover:text-brand-600">
            Trang chủ
          </Link>{' '}
          / Kiểm tra xương khớp
        </nav>
        <ScreeningStepper step={flow.step} />
        <Feedback command={flow.command} />
        {flow.step === 0 && (
          <RegionSelection
            region={flow.region}
            onSelect={flow.selectRegion}
            onContinue={() => flow.setStep(1)}
          />
        )}
        {flow.step === 1 && <ScreeningQuestions flow={flow} />}
        {flow.step === 2 && flow.result && <ScreeningResult flow={flow} />}
      </VStack>
    </VStack>
  )
}
