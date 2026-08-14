import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, BookOpen, Lightbulb, MessageSquare,
  Beaker, AlertTriangle, ClipboardCheck, Zap, BookMarked, FileText
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const SectionBlock = ({ icon: Icon, label, color, children, defaultOpen = false, isDark }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border rounded-xl overflow-hidden mb-3 last:mb-0 shadow-sm ${
      isDark ? 'border-slate-800' : 'border-slate-200'
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
          isDark ? 'bg-slate-950 hover:bg-slate-900' : 'bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        <span className={`text-sm font-semibold flex-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`p-4 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TopicCard({ topic, moduleColor }) {
  const [expanded, setExpanded] = useState(true)
  const { isDark } = useTheme()

  const shortNoteText = topic.short_notes || topic.short_note
  const longNoteText = topic.long_notes || topic.long_note

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl overflow-hidden transition-colors mb-4 shadow-sm ${
        isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Topic Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-colors ${
          isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${moduleColor || (isDark ? 'bg-indigo-950/60 text-indigo-300' : 'bg-indigo-50 text-indigo-700')}`}>
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md mono inline-block mb-1 border ${
            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {topic.topic_id}
          </span>
          <p className={`text-base font-extrabold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{topic.topic_title}</p>
        </div>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 transition-transform duration-300 mt-1 ${expanded ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        />
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-5 space-y-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="pt-4 space-y-3">
                {/* Concept */}
                {topic.concept && (
                  <SectionBlock isDark={isDark} icon={Lightbulb} label="A. Concept" color={isDark ? "bg-amber-950/60 text-amber-300 border border-amber-800" : "bg-amber-50 text-amber-700 border border-amber-200"} defaultOpen>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{topic.concept}</p>
                  </SectionBlock>
                )}

                {/* Prerequisites */}
                {topic.prerequisites?.length > 0 && (
                  <SectionBlock isDark={isDark} icon={BookMarked} label="B. Prerequisites" color={isDark ? "bg-violet-950/60 text-violet-300 border border-violet-800" : "bg-violet-50 text-violet-700 border border-violet-200"}>
                    <ul className="space-y-1.5">
                      {topic.prerequisites.map((p, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </SectionBlock>
                )}

                {/* Explanation */}
                {topic.explanation && (
                  <SectionBlock isDark={isDark} icon={MessageSquare} label="C. Explanation" color={isDark ? "bg-sky-950/60 text-sky-300 border border-sky-800" : "bg-sky-50 text-sky-700 border border-sky-200"}>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{topic.explanation}</p>
                  </SectionBlock>
                )}

                {/* Examples */}
                {topic.examples?.length > 0 && (
                  <SectionBlock isDark={isDark} icon={Zap} label="D. Examples" color={isDark ? "bg-teal-950/60 text-teal-300 border border-teal-800" : "bg-teal-50 text-teal-700 border border-teal-200"}>
                    <div className="space-y-2">
                      {topic.examples.map((ex, i) => (
                        <div key={i} className={`border rounded-xl p-3 text-sm ${
                          isDark ? 'bg-teal-950/40 border-teal-800/80 text-slate-300' : 'bg-teal-50/50 border-teal-200 text-slate-700'
                        }`}>
                          {typeof ex === 'object' ? (
                            <>
                              <span className={`font-bold block mb-1 ${isDark ? 'text-teal-300' : 'text-teal-900'}`}>{ex.title || `Example ${i+1}`}</span>
                              <span>{ex.content || JSON.stringify(ex)}</span>
                            </>
                          ) : (
                            <span>{ex}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Practice Problems */}
                {topic.practice_problems?.length > 0 && (
                  <SectionBlock isDark={isDark} icon={Beaker} label="E. Practice Problems" color={isDark ? "bg-indigo-950/60 text-indigo-300 border border-indigo-800" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}>
                    <div className="space-y-2">
                      {topic.practice_problems.map((prob, i) => (
                        <div key={i} className={`rounded-xl p-3 border text-sm ${
                          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          {typeof prob === 'object' ? prob.question || JSON.stringify(prob) : prob}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Misconceptions */}
                {topic.misconceptions?.length > 0 && (
                  <SectionBlock isDark={isDark} icon={AlertTriangle} label="F. Common Misconceptions" color={isDark ? "bg-rose-950/60 text-rose-300 border border-rose-800" : "bg-rose-50 text-rose-700 border border-rose-200"}>
                    <div className="space-y-2">
                      {topic.misconceptions.map((m, i) => (
                        <div key={i} className={`border rounded-xl p-3 text-sm ${
                          isDark ? 'bg-rose-950/40 border-rose-800/80 text-slate-300' : 'bg-rose-50/50 border-rose-200 text-slate-700'
                        }`}>
                          {typeof m === 'object' ? (
                            <>
                              <p className={`font-semibold mb-1 ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>❌ {m.myth || m.misconception}</p>
                              <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>✓ {m.reality || m.correction}</p>
                            </>
                          ) : (
                            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{m}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Assessment */}
                {topic.assessment && (
                  <SectionBlock isDark={isDark} icon={ClipboardCheck} label="G. Assessment" color={isDark ? "bg-orange-950/60 text-orange-300 border border-orange-800" : "bg-orange-50 text-orange-700 border border-orange-200"}>
                    <div className={`space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {Array.isArray(topic.assessment) ? (
                        topic.assessment.map((item, i) => (
                          <div key={i} className={`rounded-xl p-3 border whitespace-pre-wrap ${
                            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            {item}
                          </div>
                        ))
                      ) : typeof topic.assessment === 'object' ? (
                        <>
                          {topic.assessment.questions?.map((q, i) => (
                            <div key={i} className={`rounded-xl p-3 border ${
                              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                              {q}
                            </div>
                          ))}
                          <div className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Difficulty: {topic.assessment.difficulty || 'Intermediate'} | Weightage: {topic.assessment.exam_weightage || 'High'}
                          </div>
                        </>
                      ) : (
                        <p>{String(topic.assessment)}</p>
                      )}
                    </div>
                  </SectionBlock>
                )}

                {/* H. Short Note — Quick Revision */}
                {shortNoteText && (
                  <SectionBlock isDark={isDark} icon={FileText} label="H. Short Note — Quick Revision" color={isDark ? "bg-amber-950/60 text-amber-300 border border-amber-800" : "bg-amber-50 text-amber-700 border border-amber-200"}>
                    <div className={`space-y-2 text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {Array.isArray(shortNoteText) ? (
                        shortNoteText.map((sn, i) => (
                          <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border ${
                            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{sn}</span>
                          </div>
                        ))
                      ) : (
                        <p>{String(shortNoteText)}</p>
                      )}
                    </div>
                  </SectionBlock>
                )}

                {/* I. Long Note — Comprehensive Synthesis */}
                {longNoteText && (
                  <SectionBlock isDark={isDark} icon={BookOpen} label="I. Long Note — Comprehensive Synthesis" color={isDark ? "bg-indigo-950/60 text-indigo-300 border border-indigo-800" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {Array.isArray(longNoteText) ? (
                        longNoteText.map((ln, i) => (
                          <p key={i} className="mb-2 last:mb-0">{ln}</p>
                        ))
                      ) : (
                        <p>{String(longNoteText)}</p>
                      )}
                    </div>
                  </SectionBlock>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
