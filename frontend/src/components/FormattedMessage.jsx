import katex from 'katex'
import { CheckCircle2, BookOpen, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Renders LaTeX math equations using KaTeX.
 */
function MathSnippet({ math, displayMode = false }) {
  if (!math || !math.trim()) return null
  try {
    let clean = math.trim()

    // Remove surrounding LaTeX delimiters if passed directly
    clean = clean.replace(/^\\\[\s*/, '').replace(/\s*\\\]$/, '')
    clean = clean.replace(/^\\\(\s*/, '').replace(/\s*\\\)$/, '')
    clean = clean.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '')
    clean = clean.replace(/^\$\s*/, '').replace(/\s*\$$/, '')

    // Convert raw ASCII approximations into LaTeX commands if unescaped
    if (!clean.includes('\\')) {
      clean = clean.replace(/\bint\b/g, '\\int')
      clean = clean.replace(/\bfrac\b/g, '\\frac')
      clean = clean.replace(/\blim\b/g, '\\lim')
    }

    const html = katex.renderToString(clean, {
      displayMode,
      throwOnError: false,
    })

    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        className={displayMode ? 'block my-2 text-center overflow-x-auto py-1.5 px-3 rounded-lg bg-slate-950/20 border border-indigo-500/20' : 'inline-block px-1 font-normal'}
      />
    )
  } catch (e) {
    return <span className="font-mono text-indigo-400">{math}</span>
  }
}

/**
 * Renders bolding (**text**) and italics (*text*).
 */
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

/**
 * Parses mixed text and LaTeX math delimiters (\(...\), \[...\], $$...$$, $...$).
 */
function renderLineWithMathAndStyles(line, isDark) {
  if (!line) return null

  // Clean trailing standalone asterisks on headers like "Step 1: Find f(3)*"
  const cleanLine = line.replace(/(\w+):\*/g, '$1:').replace(/(\w+)\*/g, '$1')

  // Math delimiter regex: matches \[...\], \(...\), $$...$$, $...$
  const mathRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|^\$\$[\s\S]*?\$\$|\$[^\$\n]+\$)/g

  const segments = []
  let lastIdx = 0
  let match
  let key = 0

  while ((match = mathRegex.exec(cleanLine)) !== null) {
    if (match.index > lastIdx) {
      const textPart = cleanLine.substring(lastIdx, match.index)
      segments.push(<span key={key++}>{renderStyledInlineText(textPart, isDark)}</span>)
    }

    const rawMath = match[0]
    const isDisplay = rawMath.startsWith('\\[') || rawMath.startsWith('$$')
    segments.push(<MathSnippet key={key++} math={rawMath} displayMode={isDisplay} />)

    lastIdx = mathRegex.lastIndex
  }

  if (lastIdx < cleanLine.length) {
    const textPart = cleanLine.substring(lastIdx)
    segments.push(<span key={key++}>{renderStyledInlineText(textPart, isDark)}</span>)
  }

  // Fallback: If line contains raw LaTeX math symbols (\int, \frac, e^{...}, \lim) without \( \) wrappers, render whole line as KaTeX math if appropriate
  if (segments.length === 0 || (segments.length === 1 && typeof segments[0] === 'string')) {
    if (/(\\int|\\frac|\\lim|e\^\{|\\to|\\sum|\\sqrt)/.test(cleanLine)) {
      return <MathSnippet math={cleanLine} displayMode={cleanLine.length > 25} />
    }
    return renderStyledInlineText(cleanLine, isDark)
  }

  return segments
}

export default function FormattedMessage({ text }) {
  const { isDark } = useTheme()
  if (!text) return null

  const rawLines = text.split('\n')

  // Filter out source lines and standalone markdown separators
  const filteredLines = rawLines.filter((l) => {
    const t = l.trim()
    if (t === 'Source:' || t === 'Sources:' || /^Page\s+\d+$/i.test(t) || t === '--' || t === '---') {
      return false
    }
    return true
  })

  return (
    <div className={`space-y-2.5 text-xs leading-relaxed font-sans ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {filteredLines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Skip standalone LaTeX bracket lines
        if (trimmed === '\\[' || trimmed === '\\]' || trimmed === '\\(' || trimmed === '\\)' || trimmed === '$$') return null

        const cleanLine = trimmed.replace(/^#{1,6}\s*/, '')

        // Direct Answer Header
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
              <div className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {renderLineWithMathAndStyles(content || cleanLine, isDark)}
              </div>
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

        // Worked Example Header
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
                <div className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                  {renderLineWithMathAndStyles(content, isDark)}
                </div>
              )}
            </div>
          )
        }

        // Pro Tip Box
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
              <div className={`text-xs font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {renderLineWithMathAndStyles(content || cleanLine, isDark)}
              </div>
            </div>
          )
        }

        // Code / Step / Math Box
        const isMathStep = /^(Step\s*\d+:|Formula:|Problem:|Solution:|Proof:|Given:|Conclusion:|Answer:|Example\s*\d+:)/i.test(trimmed)
        if (isMathStep) {
          return (
            <div key={idx} className={`p-2.5 rounded-lg border font-mono text-[11px] my-1 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}>
              {renderLineWithMathAndStyles(cleanLine, isDark)}
            </div>
          )
        }

        // Display Math Line (e.g. \int e^x dx = e^x + C or int e^{kx} dx = ...)
        if (/^(\\int|int\s|\\frac|\\lim|e\^\{|\\to|\\sum|\\sqrt)/.test(trimmed)) {
          return (
            <div key={idx} className="my-1.5">
              <MathSnippet math={trimmed} displayMode={true} />
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
              <div className="flex-1">{renderLineWithMathAndStyles(bulletContent, isDark)}</div>
            </div>
          )
        }

        // Standard Paragraph
        return (
          <div key={idx} className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {renderLineWithMathAndStyles(cleanLine, isDark)}
          </div>
        )
      })}
    </div>
  )
}
