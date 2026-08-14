import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, BookOpen, Lightbulb, MessageSquare,
  Beaker, AlertTriangle, ClipboardCheck, Zap, BookMarked
} from 'lucide-react'

const SectionBlock = ({ icon: Icon, label, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden mb-3 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/60 hover:bg-slate-800/80 transition-colors text-left"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-sm font-semibold text-slate-200 flex-1">{label}</span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
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
            <div className="p-4 bg-slate-900/40 border-t border-slate-700/30">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/30 border border-slate-700/40 rounded-2xl overflow-hidden hover:border-slate-600/60 transition-colors mb-4"
    >
      {/* Topic Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-800/40 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${moduleColor}`}>
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-700 text-slate-300 mono inline-block mb-1">
            {topic.topic_id}
          </span>
          <p className="text-base font-extrabold text-slate-100 leading-snug">{topic.topic_title}</p>
        </div>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-300 mt-1 ${expanded ? 'rotate-180' : ''}`}
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
            <div className="px-5 pb-5 space-y-3 border-t border-slate-700/30">
              <div className="pt-4 space-y-3">
                {/* Concept */}
                {topic.concept && (
                  <SectionBlock icon={Lightbulb} label="A. Concept" color="bg-amber-500/20 text-amber-300" defaultOpen>
                    <p className="text-sm text-slate-300 leading-relaxed">{topic.concept}</p>
                  </SectionBlock>
                )}

                {/* Prerequisites */}
                {topic.prerequisites?.length > 0 && (
                  <SectionBlock icon={BookMarked} label="B. Prerequisites" color="bg-violet-500/20 text-violet-300">
                    <ul className="space-y-1.5">
                      {topic.prerequisites.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </SectionBlock>
                )}

                {/* Explanation */}
                {topic.explanation && (
                  <SectionBlock icon={MessageSquare} label="C. Explanation" color="bg-sky-500/20 text-sky-300">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{topic.explanation}</p>
                  </SectionBlock>
                )}

                {/* Examples */}
                {topic.examples?.length > 0 && (
                  <SectionBlock icon={Zap} label="D. Examples" color="bg-teal-500/20 text-teal-300">
                    <div className="space-y-2">
                      {topic.examples.map((ex, i) => (
                        <div key={i} className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3 text-sm text-slate-300">
                          {typeof ex === 'object' ? (
                            <>
                              <span className="font-bold text-teal-300 block mb-1">{ex.title || `Example ${i+1}`}</span>
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
                  <SectionBlock icon={Beaker} label="E. Practice Problems" color="bg-indigo-500/20 text-indigo-300">
                    <div className="space-y-2">
                      {topic.practice_problems.map((prob, i) => (
                        <div key={i} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-sm text-slate-200">
                          {typeof prob === 'object' ? prob.question || JSON.stringify(prob) : prob}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Misconceptions */}
                {topic.misconceptions?.length > 0 && (
                  <SectionBlock icon={AlertTriangle} label="F. Common Misconceptions" color="bg-rose-500/20 text-rose-300">
                    <div className="space-y-2">
                      {topic.misconceptions.map((m, i) => (
                        <div key={i} className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-sm text-slate-300">
                          {typeof m === 'object' ? (
                            <>
                              <p className="text-rose-300 font-semibold mb-1">❌ {m.myth || m.misconception}</p>
                              <p className="text-slate-300">✓ {m.reality || m.correction}</p>
                            </>
                          ) : (
                            <p className="text-slate-300">{m}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* Assessment */}
                {topic.assessment && (
                  <SectionBlock icon={ClipboardCheck} label="G. Assessment" color="bg-orange-500/20 text-orange-300">
                    <div className="space-y-2 text-sm text-slate-300">
                      {Array.isArray(topic.assessment) ? (
                        topic.assessment.map((item, i) => (
                          <div key={i} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 whitespace-pre-wrap">
                            {item}
                          </div>
                        ))
                      ) : typeof topic.assessment === 'object' ? (
                        <>
                          {topic.assessment.questions?.map((q, i) => (
                            <div key={i} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                              {q}
                            </div>
                          ))}
                          <div className="text-xs text-slate-400 mt-2">
                            Difficulty: {topic.assessment.difficulty || 'Intermediate'} | Weightage: {topic.assessment.exam_weightage || 'High'}
                          </div>
                        </>
                      ) : (
                        <p>{String(topic.assessment)}</p>
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
