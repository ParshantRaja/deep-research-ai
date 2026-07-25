"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { ExternalLink, Calendar, Clock, FileText, ChevronRight, Zap, TrendingUp, ShieldCheck, Cpu, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const PDFDownloadButton = dynamic(
  () => import("@/components/pdf-download-button").then((mod) => mod.PDFDownloadButton),
  { ssr: false }
)

export interface Subsection {
  subtitle: string
  content: string
}

export interface ReportSection {
  title: string
  content: string
  subsections?: Subsection[]
}

export interface ReportSource {
  name: string
  url: string
}

export interface Report {
  id: string
  title: string
  summary: string
  sections: ReportSection[]
  sources: ReportSource[]
  generatedAt: Date
  researchTime: string
}

interface ReportViewProps {
  report: Report | null
  isGenerating: boolean
  onBack?: () => void
}

export function ReportView({ report, isGenerating, onBack }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  const renderContentWithCitations = (content: string) => {
    // Detects both [1] style citations and URLs
    const parts = content.split(/(\[\d+\]|https?:\/\/[^\s\n]+|\bwww\.[^\s\n]+|\b[a-z0-9]+\.[a-z]{2,}(?:\/[^\s\n]*)?)/gi)
    return parts.map((part, i) => {
      // Handle Citations [1]
      const citationMatch = part.match(/\[(\d+)\]/)
      if (citationMatch) {
        return (
          <sup key={i} className="text-[10px] font-bold text-cyan-500 mx-0.5 hover:text-cyan-400 cursor-pointer transition-colors">
            {part}
          </sup>
        )
      }

      // Handle URLs
      const isUrl = part.match(/^(https?:\/\/|www\.|[a-z0-9]+\.[a-z]{2,})/i)
      if (isUrl) {
        const href = part.startsWith('http') ? part : `https://${part}`
        return (
          <a 
            key={i} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline break-all inline-block"
          >
            {part}
          </a>
        )
      }

      return part
    })
  }

  if (isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full overflow-hidden rounded-[2rem] border border-border dark:border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-3xl p-12 shadow-2xl shadow-black/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-cyan-500/10 mb-8 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Cpu className="h-12 w-12 text-cyan-500 animate-pulse" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-3xl"
            />
          </div>
          <h3 className="text-3xl font-bold text-foreground dark:text-white mb-4 tracking-tighter uppercase">
            Synthesizing Intelligence
          </h3>
          <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-lg leading-relaxed font-medium">
            Cross-referencing global databases and analyzing market dynamics...
          </p>
          
          <div className="mt-10 w-full max-w-xs h-1 bg-muted dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>
    )
  }

  if (!report) {
    return (
      <div className="relative w-full rounded-[2rem] border border-border dark:border-white/5 bg-card/20 dark:bg-white/[0.01] backdrop-blur-sm p-12">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-muted dark:bg-white/[0.03] border border-border dark:border-white/5 mb-8">
            <FileText className="h-10 w-10 text-muted-foreground dark:text-slate-700" />
          </div>
          <h3 className="text-2xl font-bold text-muted-foreground dark:text-slate-400 mb-2 tracking-tight">
            Research Ready
          </h3>
          <p className="text-base text-muted-foreground/60 dark:text-slate-600 max-w-sm font-medium">
            Awaiting your research parameters to initiate analysis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      lang="en"
      className="relative mx-auto w-full max-w-[850px] min-h-[500px] md:min-h-[1100px] rounded-xl border border-border dark:border-white/10 bg-card dark:bg-black/40 shadow-2xl shadow-black/10 overflow-hidden flex flex-col hyphens-auto"
      style={{ textJustify: 'inter-word' }}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-4 py-6 md:px-8 md:py-8 border-b border-border dark:border-white/10 flex flex-col md:flex-row items-start justify-between gap-6 bg-muted/10 dark:bg-white/[0.01] pdf-export-element">
        <div className="flex flex-col gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-cyan-500 transition-colors w-fit group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
          )}
          <div className="space-y-3 md:space-y-5">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em]"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Intelligence Verified
            </motion.div>
            <h2 className="text-lg md:text-2xl font-bold text-foreground dark:text-white tracking-tight leading-[1.2] max-w-3xl">
              {report.title}
            </h2>
          </div>
        </div>
        <div className="shrink-0 pt-0 md:pt-2">
          <PDFDownloadButton targetRef={reportRef} filename={report.title} />
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="relative z-10 flex-1 p-6 md:p-16 space-y-8 md:space-y-12 overflow-y-auto custom-scrollbar bg-white dark:bg-transparent text-slate-900 dark:text-slate-200">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="pdf-export-element">
            <h3 className="text-2xl font-bold text-foreground dark:text-white tracking-tight">
              Abstract
            </h3>
            <p className="text-base text-muted-foreground dark:text-slate-400 leading-relaxed mt-4 whitespace-pre-line text-justify break-words">
              {report.summary}
            </p>
          </div>
        </motion.div>

        {/* Dynamic Sections */}
        <div className="space-y-12">
          {report.sections.map((section, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="space-y-6"
            >
              <div className="space-y-4 pdf-export-element">
                <h3 className="text-2xl font-bold text-foreground dark:text-white tracking-tight">
                  {section.title}
                </h3>
                <p className={cn(
                  "text-base text-muted-foreground dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line",
                  section.title.toLowerCase().includes("references") ? "text-left break-all" : "text-justify break-words"
                )}>
                  {renderContentWithCitations(section.content)}
                </p>
              </div>

              {/* Subsections Renderer - Paragraph Style */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-4 pl-6">
                  {section.subsections.map((sub, subIdx) => (
                    <motion.div 
                      key={subIdx} 
                      className="group relative pdf-export-element"
                    >
                      <h4 className="text-lg font-bold text-foreground dark:text-white mb-2 tracking-wide">
                        {sub.subtitle}
                      </h4>
                      <p className={cn(
                        "text-base text-muted-foreground dark:text-slate-400 leading-relaxed whitespace-pre-line",
                        section.title.toLowerCase().includes("references") ? "text-left break-all" : "text-justify break-words"
                      )}>
                        {renderContentWithCitations(sub.content)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Sources Section */}
        <div className="pt-20 border-t border-border dark:border-white/5">
          <h4 className="text-xs font-mono font-bold text-muted-foreground/60 dark:text-slate-600 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
            <ShieldCheck className="w-4 h-4" /> Trusted Data Repositories
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.sources.map((source, index) => (
              <motion.a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                className="group flex items-center justify-between p-5 rounded-2xl bg-muted/10 dark:bg-white/[0.01] border border-border dark:border-white/[0.03] transition-all duration-300"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-black/40 border border-border dark:border-white/5 text-[10px] font-mono text-muted-foreground dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground dark:text-slate-500 group-hover:text-foreground dark:group-hover:text-slate-200 truncate transition-colors">
                    {source.name}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground/40 dark:text-slate-700 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 shrink-0 ml-4 transition-all" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}