import { Check } from 'lucide-react'
import { steps } from '../lib/screening-content'
export default function ScreeningStepper({ step }) {
  return (
    <ol aria-label="Tiến trình kiểm tra" className="grid grid-cols-3 gap-3 py-3">
      {steps.map((label, index) => (
        <li
          key={label}
          aria-current={index === step ? 'step' : undefined}
          className="flex flex-col items-center gap-2 text-center"
        >
          <strong
            className={
              'flex size-9 items-center justify-center rounded-full text-sm ' +
              (index <= step ? 'bg-brand-600 text-white shadow-sm' : 'bg-brand-100 text-brand-800')
            }
          >
            {index < step ? <Check size={18} aria-hidden="true" /> : index + 1}
          </strong>
          <p
            className={
              'text-xs sm:text-sm ' +
              (index === step ? 'font-semibold text-brand-700' : 'text-slate-600')
            }
          >
            {label}
          </p>
        </li>
      ))}
    </ol>
  )
}
