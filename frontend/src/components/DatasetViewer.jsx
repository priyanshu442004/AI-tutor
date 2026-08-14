import { motion } from 'framer-motion'
import TopicCard from './TopicCard'
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react'

const MODULE_COLORS = [
  'bg-indigo-500/20 text-indigo-300',
  'bg-violet-500/20 text-violet-300',
  'bg-sky-500/20 text-sky-300',
  'bg-teal-500/20 text-teal-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-emerald-500/20 text-emerald-300',
]

export default function DatasetViewer({ dataset }) {
  const meta = dataset.metadata || {}
  
  // Normalize sub_topics or modules across any key naming variation
  const subTopics = dataset.sub_topics || dataset.subtopics || dataset.sub_topic_list || []
  const modules = dataset.modules || []

  // If sub_topics format exists
  const isSubTopicsFormat = subTopics.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Metadata Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Book Name', value: meta.book_name || '—' },
          { label: 'Chapter Name', value: meta.chapter_name || '—' },
          { label: 'Chapter Topic', value: meta.chapter_topic || '—' },
          { label: 'Sub Topics Covered', value: isSubTopicsFormat ? subTopics.length : modules.reduce((a, m) => a + (m.topics?.length || 0), 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-100 line-clamp-2" title={String(value)}>
              {String(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Sub Topics rendering */}
      {isSubTopicsFormat && (
        <div className="space-y-6">
          {subTopics.map((st, idx) => {
            const color = MODULE_COLORS[idx % MODULE_COLORS.length]
            const topicObj = {
              topic_id: `SUB TOPIC ${st.sub_topic_number || idx + 1}`,
              topic_title: st.sub_topic_name || `SUB TOPIC ${idx + 1}`,
              concept: st.concept,
              prerequisites: st.prerequisites,
              explanation: st.explanation,
              examples: st.examples,
              practice_problems: st.practice_problems,
              misconceptions: st.common_misconceptions || st.misconceptions,
              assessment: st.assessment,
            }
            return (
              <TopicCard
                key={idx}
                topic={topicObj}
                moduleColor={color}
              />
            )
          })}

          {/* Short Note */}
          {dataset.short_note && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2.5 mb-3">
                <FileText className="text-amber-400" size={20} />
                <h3 className="text-base font-bold text-amber-300">SHORT NOTE — Quick Revision</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{dataset.short_note}</p>
            </div>
          )}

          {/* Long Note */}
          {dataset.long_note && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2.5 mb-3">
                <BookOpen className="text-indigo-400" size={20} />
                <h3 className="text-base font-bold text-indigo-300">LONG NOTE — Comprehensive Synthesis</h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{dataset.long_note}</p>
            </div>
          )}
        </div>
      )}

      {/* Legacy Modules rendering */}
      {!isSubTopicsFormat && modules.map((module, mIdx) => {
        const color = MODULE_COLORS[mIdx % MODULE_COLORS.length]
        return (
          <div key={module.module_id || mIdx}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}>
                {mIdx + 1}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">{module.module_title}</h2>
                <p className="text-xs text-slate-400">{module.topics?.length || 0} topic{module.topics?.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-3 pl-3 border-l-2 border-slate-700/40 ml-4">
              {(module.topics || []).map((topic, tIdx) => (
                <TopicCard key={topic.topic_id || tIdx} topic={topic} moduleColor={color} />
              ))}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
