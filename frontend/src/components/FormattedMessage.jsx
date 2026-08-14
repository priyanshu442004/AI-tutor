import { CheckCircle2, BookOpen, Sparkles } from 'lucide-react'

// Parses inline bolding (**text**) and italics (*text*) to render clean HTML <strong> and <em> without raw asterisks
function renderStyledInlineText(text) {
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
        <strong key={key++} className="font-bold text-white">
          {matched.slice(2, -2)}
        </strong>
      )
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      parts.push(
        <em key={key++} className="italic text-indigo-200">
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

// Rich Student-Centered Message Formatter: Renders section-based UI cards, example boxes, and math callouts
export default function FormattedMessage({ text }) {
  if (!text) return null

  const lines = text.split('\n')
  let currentSection = null

  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-slate-200 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        const cleanLine = trimmed.replace(/^#{1,6}\s*/, '')

        // Detect Section Headers
        if (/^Direct Answer:/i.test(trimmed)) {
          currentSection = 'direct'
          const content = cleanLine.replace(/^Direct Answer:\s*/i, '')
          return (
            <div key={idx} className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Direct Answer</span>
              </div>
              <p className="text-xs font-medium text-slate-100 leading-relaxed">
                {renderStyledInlineText(content || cleanLine)}
              </p>
            </div>
          )
        }

        if (/^(Key Concept Breakdown|Key Principles|Key Rules):/i.test(trimmed)) {
          currentSection = 'breakdown'
          return (
            <div key={idx} className="pt-2 font-extrabold text-indigo-300 text-xs tracking-wider uppercase flex items-center gap-1.5 border-t border-slate-800/80 mt-3">
              <BookOpen size={13} className="text-indigo-400" />
              <span>Key Concept Breakdown</span>
            </div>
          )
        }

        if (/^(Step-by-Step Worked Example|Practical Example|Example):/i.test(trimmed)) {
          currentSection = 'example'
          const content = cleanLine.replace(/^(Step-by-Step Worked Example|Practical Example|Example):\s*/i, '')
          return (
            <div key={idx} className="pt-2 mt-3 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-400" />
                <span>Step-by-Step Worked Example</span>
              </div>
              {content && (
                <p className="text-xs text-slate-200">
                  {renderStyledInlineText(content)}
                </p>
              )}
            </div>
          )
        }

        if (/^(Pro Student Tip|Exam Tip|Student Tip):/i.test(trimmed)) {
          currentSection = 'tip'
          const content = cleanLine.replace(/^(Pro Student Tip|Exam Tip|Student Tip):\s*/i, '')
          return (
            <div key={idx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1 my-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Pro Exam Tip</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-amber-100">
                {renderStyledInlineText(content || cleanLine)}
              </p>
            </div>
          )
        }

        // Math Step / Solution Calculation Box (e.g., Step 1:, Step 2:, Formula:)
        const isMathStep = /^(Step\s*\d+:|Formula:|Problem:|Solution:|Proof:)/i.test(trimmed)
        if (isMathStep) {
          return (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/20 font-mono text-[11px] text-indigo-200 my-1 shadow-inner">
              {renderStyledInlineText(cleanLine)}
            </div>
          )
        }

        // Bullet Point Rendering
        const isBullet = /^[•\*\-\d+\.]\s*/.test(trimmed)
        if (isBullet) {
          const bulletContent = cleanLine.replace(/^[•\*\-\d+\.]\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
              <div className="flex-1">{renderStyledInlineText(bulletContent)}</div>
            </div>
          )
        }

        // Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed text-slate-200">
            {renderStyledInlineText(cleanLine)}
          </p>
        )
      })}
    </div>
  )
}
