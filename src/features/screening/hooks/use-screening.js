import { useCallback, useState } from 'react'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { screeningApi } from '../api/screening.api'
import { answeredCount } from '../lib/screening-content'

// Health answers stay in memory. Nothing is persisted until explicit consent to save.
export function useScreening() {
  const [region, setRegion] = useState('knee')
  const [step, setStep] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [consent, setConsent] = useState(false)
  const command = useCommand()
  const definition = useResource(
    useCallback((signal) => screeningApi.definition(region, signal), [region]),
  )
  const questions = definition.data?.questions || []
  function selectRegion(value) {
    if (command.pending) return
    setRegion(value)
    setAnswers({})
    setQuestionIndex(0)
    setResult(null)
    setSaved(false)
    setConsent(false)
  }
  function restart() {
    setStep(0)
    setAnswers({})
    setQuestionIndex(0)
    setResult(null)
    setSaved(false)
    setConsent(false)
  }
  async function assess() {
    if (command.pending || !consent || answeredCount(questions, answers) !== questions.length)
      return
    const body = { region, revision: definition.data.revision, answers, consent }
    const response = await command.run(() => screeningApi.assess(body), body, '')
    if (response) {
      setResult(response)
      setSaved(false)
      setStep(2)
    }
  }
  async function save() {
    const body = { claimToken: result.claimToken, consent: true }
    const response = await command.run(
      (key) => screeningApi.save(body, key),
      body,
      'Đã lưu bản ghi triệu chứng vào tài khoản.',
    )
    if (response) setSaved(true)
  }
  return {
    region,
    step,
    setStep,
    questionIndex,
    setQuestionIndex,
    answers,
    setAnswers,
    result,
    saved,
    consent,
    setConsent,
    command,
    definition,
    questions,
    selectRegion,
    restart,
    assess,
    save,
  }
}
