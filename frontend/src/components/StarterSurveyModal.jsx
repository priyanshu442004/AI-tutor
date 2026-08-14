import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, GraduationCap, BookOpen, CheckCircle2,
  ChevronRight, ArrowLeft, X, ShieldCheck
} from 'lucide-react'

const QUESTIONS = [
  {
    id: 'goal',
    title: 'What is your primary focus or exam target?',
    subtitle: 'This helps us surface the most relevant legal topics and difficulty levels for you.',
    icon: Target,
    options: [
      { value: 'judiciary', label: 'Judicial Services Examination (PCS-J)', icon: '⚖️', desc: 'Focus on case laws, section numbers, & procedural mastery' },
      { value: 'barexam', label: 'All India Bar Examination (AIBE) / Practice', icon: '📜', desc: 'Focus on core statutory provisions & leading precedents' },
      { value: 'llb', label: 'Law School Semester / LL.B Degree Exams', icon: '🎓', desc: 'Focus on comprehensive long notes, concepts & jurisprudence' },
      { value: 'research', label: 'Legal Research & General Interest', icon: '🔍', desc: 'Explore foundational concepts and landmark rulings' },
    ],
  },
  {
    id: 'level',
    title: 'What is your current familiarity with legal textbooks?',
    subtitle: 'We will tailor explanations and practice questions according to your level.',
    icon: GraduationCap,
    options: [
      { value: 'beginner', label: 'Beginner / First-Year Law Student', icon: '🌱', desc: 'Need step-by-step concepts, clear definitions & basic examples' },
      { value: 'intermediate', label: 'Intermediate / Mid-level Study', icon: '📈', desc: 'Familiar with basic sections, want deeper case law analysis' },
      { value: 'advanced', label: 'Advanced / Exam Revision Phase', icon: '🚀', desc: 'Focus on rapid flashcards, high-yield notes & tricky MCQs' },
    ],
  },
  {
    id: 'subject',
    title: 'Which law domain are you studying right now?',
    subtitle: 'Select your immediate focus textbook.',
    icon: BookOpen,
    options: [
      { value: 'company', label: 'Company Law & Corporate Governance', icon: '🏢', desc: 'Companies Act 2013, Salomon doctrine, Corporate personality' },
      { value: 'constitution', label: 'Constitutional Law of India', icon: '🏛️', desc: 'Fundamental rights, Writs, Article 21, Basic Structure' },
      { value: 'cpc', label: 'Code of Civil Procedure (CPC 1908)', icon: '⚖️', desc: 'Res Judicata Sec 11, Order 39 Injunctions, Jurisdiction' },
      { value: 'evidence', label: 'Indian Law of Evidence', icon: '📑', desc: 'Res Gestae Sec 6, Admissions, Dying Declarations' },
    ],
  },
  {
    id: 'style',
    title: 'How do you learn legal concepts best?',
    subtitle: 'We will prioritize this layout mode when you open chapters.',
    icon: Sparkles,
    options: [
      { value: 'cases', label: 'Case Studies & Practical Scenarios', icon: '💡', desc: 'Learn through real judicial rulings & landmark decisions' },
      { value: 'flashcards', label: 'Rapid Active Recall & Flashcards', icon: '🎴', desc: 'Test knowledge with quick Q&A flip cards' },
      { value: 'mcqs', label: 'Practice Questions & Mock Quizzes', icon: '🎯', desc: 'Solve exam-style multiple choice & problem scenarios' },
      { value: 'notes', label: 'Concise Bullet Notes & Summaries', icon: '📝', desc: 'Quick high-yield revision summaries before exams' },
    ],
  },
]

export default function StarterSurveyModal({ isOpen, onClose, onComplete, initialProfile }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(initialProfile || {
    goal: 'judiciary',
    level: 'intermediate',
    subject: 'company',
    style: 'cases',
  })

  if (!isOpen) return null

  const currentQ = QUESTIONS[step]
  const progressPct = ((step + 1) / QUESTIONS.length) * 100

  const handleSelect = (val) => {
    const updated = { ...answers, [currentQ.id]: val }
    setAnswers(updated)
  }

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(answers)
      onClose()
    }
  }

  const handlePrev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles size={14} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Student Profile Setup ({step + 1} of {QUESTIONS.length})
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-800 w-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-100 mb-1 flex items-center gap-2">
                <span>{currentQ.title}</span>
              </h2>
              <p className="text-xs text-slate-400">{currentQ.subtitle}</p>
            </div>

            {/* Options list */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt) => {
                const selected = answers[currentQ.id] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200
                      ${selected
                        ? 'bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'}
                    `}
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${selected ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {opt.label}
                        </span>
                        {selected && <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0 ml-2" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Skip for now
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <span>{step === QUESTIONS.length - 1 ? 'Save & Start Learning' : 'Continue'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-slate-950/60 px-6 py-3 border-t border-slate-800/50 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            No login required. Your preferences are saved locally on your browser.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
