import { motion } from 'framer-motion'
import TopicCard from './TopicCard'
import { BookOpen, FileText } from 'lucide-react'

const MODULE_COLORS = [
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
]

export default function DatasetViewer({ dataset }) {
  const meta = dataset.metadata || {}
  
  const subTopics = dataset.sub_topics || dataset.subtopics || dataset.sub_topic_list || []
  const modules = dataset.modules || []

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
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-900 line-clamp-2" title={String(value)}>
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
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <FileText className="text-amber-600" size={20} />
                <h3 className="text-base font-bold text-amber-900">SHORT NOTE — Quick Revision</h3>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{dataset.short_note}</p>
            </div>
          )}

          {/* Long Note */}
          {dataset.long_note && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <BookOpen className="text-indigo-600" size={20} />
                <h3 className="text-base font-bold text-indigo-900">LONG NOTE — Comprehensive Synthesis</h3>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{dataset.long_note}</p>
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
                <h2 className="text-base font-bold text-slate-900">{module.module_title}</h2>
                <p className="text-xs text-slate-500">{module.topics?.length || 0} topic{module.topics?.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-3 pl-3 border-l-2 border-slate-200 ml-4">
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
