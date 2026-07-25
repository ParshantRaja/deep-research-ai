"use client"

import { useState, useEffect } from "react"
import { Search, Sparkles, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
}

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const topicPool = [
      "Neural Architecture", "Biotech Ethics", "Solid State Batteries", 
      "Fusion Energy", "Deep Sea Mining", "AGI Safety", 
      "Space Elevator", "Cyber-Physical Systems", "Quantum Cryptography", 
      "Synthetic Biology", "Web3 Economics", "Metaverse Governance",
      "Climate Change", "Quantum Computing", "Mars Colonization",
      "Graphene Sensors", "Digital Twins", "Brain-Machine Interface"
    ]
    const shuffled = [...topicPool].sort(() => 0.5 - Math.random())
    setSuggestions(shuffled.slice(0, 3))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isSearching) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 group cursor-help">
          <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 group-hover:scale-125 transition-transform" />
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.2em]">Neural Research Engine Active</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2 tracking-tight">
          What would you like to explore?
        </h2>
        <p className="text-muted-foreground dark:text-slate-400 text-sm font-medium">
          Our agent will synthesize data from global sources in real-time.
        </p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="relative group">
        <motion.div 
          animate={isSearching ? { scale: [1, 1.01, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={cn(
            "relative flex items-center rounded-2xl border transition-all duration-500 overflow-hidden",
            "bg-card/80 dark:bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/5",
            isSearching 
              ? "border-cyan-500/50 shadow-cyan-500/10 ring-4 ring-cyan-500/5" 
              : "border-border dark:border-white/10 hover:border-border/80 dark:hover:border-white/20 group-hover:shadow-black/10"
          )}
        >
          <div className="pl-3 sm:pl-6">
            <Search className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500",
              isSearching ? "text-cyan-500 scale-110" : "text-muted-foreground dark:text-slate-500"
            )} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research topic..."
            disabled={isSearching}
            className={cn(
              "flex-1 px-2 sm:px-4 py-4 sm:py-6 bg-transparent text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-600 font-medium",
              "focus:outline-none text-base sm:text-lg",
              isSearching && "opacity-50"
            )}
          />
          <div className="pr-2 sm:pr-3">
            <Button 
              type="submit" 
              disabled={!query.trim() || isSearching}
              className={cn(
                "rounded-xl h-10 sm:h-12 px-3 sm:px-6 font-bold transition-all duration-500",
                isSearching 
                  ? "bg-cyan-500 text-white" 
                  : "bg-primary text-primary-foreground dark:bg-white dark:text-black hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-400"
              )}
            >
              {isSearching ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="uppercase tracking-widest text-[8px] sm:text-[10px] hidden xs:block">Processing</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block">Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      </form>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mt-6"
      >
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            disabled={isSearching}
            className={cn(
              "px-4 py-2 text-xs font-mono rounded-full border border-border dark:border-white/5 bg-muted/50 dark:bg-white/[0.02]",
              "text-muted-foreground dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5",
              "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {suggestion}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
