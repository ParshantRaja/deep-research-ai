"use client"

import { useEffect, useRef } from "react"
import { Globe, FileSearch, Brain, CheckCircle, Loader2, Database, BookOpen, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface ActivityItem {
  id: string
  type: "search" | "read" | "analyze" | "database" | "complete"
  message: string
  source?: string
  timestamp: Date
  status: "active" | "completed"
}

interface ActivityLogProps {
  activities: ActivityItem[]
  isActive: boolean
}

const iconMap = {
  search: Globe,
  read: BookOpen,
  analyze: Brain,
  database: Database,
  complete: CheckCircle,
}

const colorMap = {
  search: "text-cyan-400",
  read: "text-purple-400",
  analyze: "text-emerald-400",
  database: "text-blue-400",
  complete: "text-emerald-400",
}

export function ActivityLog({ activities, isActive }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activities])

  if (activities.length === 0 && !isActive) {
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 dark:bg-black/40 backdrop-blur-xl rounded-xl border border-border dark:border-white/10 overflow-hidden shadow-2xl shadow-black/5"
    >
      <div className="px-4 py-3 border-b border-border dark:border-white/5 flex items-center justify-between bg-muted/20 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <div className="h-4 w-px bg-border dark:bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest">System Process</h3>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400/80 uppercase tracking-tighter">Live Monitor</span>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="max-h-72 overflow-y-auto p-4 space-y-4 font-mono scrollbar-none"
      >
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.type]
            const isLatest = index === activities.length - 1 && activity.status === "active"
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                className={cn(
                  "flex items-start gap-4 group",
                  activity.status === "completed" && "opacity-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500",
                  "bg-muted/50 dark:bg-white/[0.03] border border-border dark:border-white/5 group-hover:bg-muted dark:group-hover:bg-white/[0.08] group-hover:border-border dark:group-hover:border-white/10",
                  isLatest && "ring-1 ring-cyan-500/30 bg-cyan-500/5"
                )}>
                  {isLatest ? (
                    <Loader2 className={cn("w-5 h-5 animate-spin", colorMap[activity.type])} />
                  ) : (
                    <Icon className={cn("w-5 h-5", colorMap[activity.type])} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isLatest ? "text-foreground dark:text-white font-medium" : "text-muted-foreground dark:text-slate-400"
                    )}>
                      <span className="text-cyan-600 dark:text-cyan-500/50 mr-2 text-xs">[{activity.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                      {activity.message}
                    </p>
                    {activity.status === "completed" && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  {activity.source && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-border dark:bg-white/20" />
                      Ref: {activity.source}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {activities.length === 0 && isActive && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="text-xs text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Initializing Core...</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
