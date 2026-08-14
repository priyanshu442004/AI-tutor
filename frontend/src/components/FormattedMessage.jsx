import { CheckCircle2, BookOpen, Sparkles, ShieldCheck } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function renderStyledInlineText(text, isDark) {
  if (!text) return null
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  const parts = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>)
    }
    const matched = match[0]
    if (matched.startsWith('**') && matched.endsWith('**')) {
      parts.push(
        <strong key={key++} className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {matched.slice(2, -2)}
        </strong>
      )
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      parts.push(
        <em key={key++} className={`italic font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
          {matched.slice(1, -1)}
        </em>
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(lastIndex)}</span>)
  }

  return parts.length > 0 ? parts : text
}

export default function FormattedMessage({ text }) {
  const { isDark } = useTheme()
  if (!text) return null

  const lines = text.split('\n')

  return (
    <div className={`space-y-2.5 text-xs leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        const cleanLine = trimmed.replace(/^#{1,6}\s*/, '')

        // Direct Answer / Opinion Header
        if (/^(Direct Answer|Direct Legal Position|Direct Legal Opinion):/i.test(trimmed)) {
          const content = cleanLine.replace(/^(Direct Answer|Direct Legal Position|Direct Legal Opinion):\s*/i, '')
          return (
            <div key={idx} className={`p-3 rounded-xl border space-y-1 shadow-sm ${
              isDark ? 'bg-indigo-950/60 border-indigo-800' : 'bg-indigo-50/70 border-indigo-200'
            }`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isDark ? 'text-indigo-300' : 'text-indigo-700'
              }`}>
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>{/Legal/i.test(trimmed) ? 'Direct Legal Position' : 'Direct Answer'}</span>
              </div>
              <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {renderStyledInlineText(content || cleanLine, isDark)}
              </p>
            </div>
          )
        }

        // Section Breakdown Header
        if (/^(Key Concept Breakdown|Statutory Framework & Case Precedents|Key Principles|Key Rules):/i.test(trimmed)) {
          return (
            <div key={idx} className={`pt-2 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 border-t mt-3 ${
              isDark ? 'text-indigo-300 border-slate-800' : 'text-indigo-900 border-slate-200'
            }`}>
              <BookOpen size={13} className="text-indigo-500" />
              <span>{cleanLine}</span>
            </div>
          )
        }

        // Worked Example / Implications Header
        if (/^(Step-by-Step Worked Example|Practical & Corporate Implications|Practical Example|Example):/i.test(trimmed)) {
          const content = cleanLine.replace(/^(Step-by-Step Worked Example|Practical & Corporate Implications|Practical Example|Example):\s*/i, '')
          return (
            <div key={idx} className={`pt-2 mt-3 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                <Sparkles size={12} className="text-amber-500" />
                <span>{cleanLine.includes('Corporate') ? 'Practical & Corporate Implications' : 'Step-by-Step Worked Example'}</span>
              </div>
              {content && (
                <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                  {renderStyledInlineText(content, isDark)}
                </p>
              )}
            </div>
          )
        }

        // Pro Tip / Recommendation Box
        if (/^(Pro Student Tip|Strategic Recommendation|Exam Tip|Student Tip):/i.test(trimmed)) {
          const content = cleanLine.replace(/^(Pro Student Tip|Strategic Recommendation|Exam Tip|Student Tip):\s*/i, '')
          return (
            <div key={idx} className={`p-3 rounded-xl border space-y-1 my-2 shadow-sm ${
              isDark ? 'bg-amber-950/60 border-amber-800/80 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isDark ? 'text-amber-300' : 'text-amber-800'
              }`}>
                <Sparkles size={12} className="text-amber-500" />
                <span>{cleanLine.includes('Recommendation') ? 'Strategic Recommendation' : 'Pro Exam Tip'}</span>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {renderStyledInlineText(content || cleanLine, isDark)}
              </p>
            </div>
          )
        }

        // Code / Formula Box
        const isMathStep = /^(Step\s*\d+:|Formula:|Problem:|Solution:|Proof:)/i.test(trimmed)
        if (isMathStep) {
          return (
            <div key={idx} className={`p-2.5 rounded-lg border font-mono text-[11px] my-1 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}>
              {renderStyledInlineText(cleanLine, isDark)}
            </div>
          )
        }

        // Bullet Point
        const isBullet = /^[•\*\-\d+\.]\s*/.test(trimmed)
        if (isBullet) {
          const bulletContent = cleanLine.replace(/^[•\*\-\d+\.]\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1">{renderStyledInlineText(bulletContent, isDark)}</div>
            </div>
          )
        }

        // Standard Paragraph
        return (
          <p key={idx} className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {renderStyledInlineText(cleanLine, isDark)}
          </p>
        )
      })}
    </div>
  )
}
