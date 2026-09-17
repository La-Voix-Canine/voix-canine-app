import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function BackHeader({ title, subtitle, right }) {
  const navigate = useNavigate()
  return (
    <header className="bg-brand-dark text-white px-2 pt-6 pb-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 px-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-white/90 active:scale-95"
          aria-label="Retour"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function TabBar({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 px-3 pt-3 overflow-x-auto bg-brand-dark">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={
            'px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition ' +
            (value === t.value
              ? 'bg-brand-light text-brand-dark'
              : 'text-white/70 hover:text-white')
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function SectionCard({ title, children, className = '' }) {
  return (
    <div className={'bg-white rounded-xl shadow-sm p-4 ' + className}>
      {title && <h2 className="font-medium mb-3">{title}</h2>}
      {children}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand bg-white'

export function TextInput(props) {
  return <input {...props} className={inputClass + ' ' + (props.className || '')} />
}

export function Textarea(props) {
  return <textarea {...props} className={inputClass + ' ' + (props.className || '')} />
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={inputClass + ' ' + (props.className || '')}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 w-full text-left py-1"
    >
      <span
        className={
          'w-11 h-6 rounded-full relative transition shrink-0 ' +
          (checked ? 'bg-brand' : 'bg-gray-300')
        }
      >
        <span
          className={
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ' +
            (checked ? 'left-5' : 'left-0.5')
          }
        />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 w-full text-left py-2"
    >
      <span
        className={
          'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition ' +
          (checked ? 'bg-brand border-brand' : 'border-gray-300 bg-white')
        }
      >
        {checked && (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={
        'bg-brand-dark text-white rounded-lg py-2.5 px-4 font-medium disabled:opacity-60 active:scale-[0.99] transition ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={
        'bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 px-4 font-medium disabled:opacity-60 active:scale-[0.99] transition ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function Toast({ message, type = 'success' }) {
  if (!message) return null
  return (
    <div
      className={
        'fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white z-50 ' +
        (type === 'error' ? 'bg-red-600' : 'bg-brand-dark')
      }
    >
      {message}
    </div>
  )
}
