"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { ResearchSidebar } from "@/components/research-sidebar"
import { Logo } from "@/components/logo"
import { SearchBar } from "@/components/search-bar"
import { ActivityLog, type ActivityItem } from "@/components/activity-log"
import { ReportView, type Report } from "@/components/report-view"
import { BackgroundBeams } from "@/components/background-beams"
import { motion, AnimatePresence } from "framer-motion"
import { deepCoreReport } from "../deep-core-report"

const mockReportsData: Record<string, Report> = {
  "5": deepCoreReport,
  "1": {
    id: "1",
    title: "Research Report: Future of Renewable Energy",
    summary: "This comprehensive research report analyzes the future of renewable energy through multiple perspectives, examining solar, wind, hydrogen, and emerging technologies. Our analysis identifies key trends in policy, investment, and technological advancement shaping the global energy transition.",
    sections: [
      {
        title: "Key Findings & Market Dynamics",
        content: "The renewable energy sector is experiencing a period of hyper-growth [1], driven by a combination of technological breakthroughs, shifting geopolitical priorities, and an urgent global mandate to decarbonize. Our extensive analysis indicates that we have passed the tipping point where renewable sources are now fundamentally more economically viable than fossil fuels in a majority of global markets [2].",
        subsections: [
          {
            subtitle: "Solar Dominance",
            content: "Solar energy costs have dropped 89% since 2010, making it the cheapest source of electricity in history [2]. Advanced photovoltaic materials and bifacial panels are driving efficiencies beyond traditional theoretical limits."
          },
          {
            subtitle: "Wind Power Expansion",
            content: "Wind power capacity is expected to triple by 2030 [1]. Innovations in offshore floating platforms are unlocking access to deep-water resources previously considered commercially unviable, opening massive new markets in coastal regions."
          }
        ]
      },
      {
        title: "Investment & Economic Outlook",
        content: "Global capital flows are aggressively pivoting towards green technologies. Institutional investors are increasingly applying stringent ESG criteria, effectively raising the cost of capital for carbon-intensive industries while subsidizing clean tech innovation.",
        subsections: [
          {
            subtitle: "Capital Allocation Trends",
            content: "Global renewable energy investment reached $495 billion in 2025, with projections exceeding $700 billion by 2030. Venture capital is particularly focused on grid-scale storage solutions and smart grid management software."
          },
          {
            subtitle: "Regional Power Shifts",
            content: "China leads in manufacturing capacity and raw material processing, while the US and EU are accelerating domestic production capabilities through massive policy incentives like the Inflation Reduction Act. Emerging markets in Africa represent the fastest-growing opportunities for decentralized, off-grid solutions."
          }
        ]
      },
      {
        title: "Technology Trends",
        content: "Technological innovation remains the primary engine of cost reduction and efficiency gains across all renewable energy verticals. The convergence of AI, advanced materials science, and power electronics is creating entirely new paradigms for energy generation and distribution.",
        subsections: [
          {
            subtitle: "Next-Generation Materials",
            content: "Next-generation perovskite solar cells promise efficiency gains of 30%+ and can be manufactured using low-energy, solution-based processes, radically reducing the carbon footprint of the solar supply chain itself."
          },
          {
            subtitle: "Energy Storage Breakthroughs",
            content: "Battery storage costs continue declining rapidly. While lithium-ion dominates currently, solid-state batteries and novel flow battery architectures are expected to reach commercial scale by 2028, fundamentally solving the intermittency problem of renewables."
          }
        ]
      },
      {
        title: "Recommendations",
        content: "To thrive in this rapidly evolving landscape, organizations must adopt proactive and aggressive strategies. Delaying the transition to renewable energy structures is now a significant financial and operational risk.",
        subsections: [
          {
            subtitle: "Strategic Initiatives",
            content: "Organizations should develop comprehensive renewable procurement strategies to hedge against fossil fuel price volatility and secure long-term energy cost stability. Investing in localized energy storage will maximize renewable utilization and provide resilience against grid instability."
          },
          {
            subtitle: "Policy and Adaptation",
            content: "It is critical to actively monitor policy developments for incentive opportunities and compliance requirements. Furthermore, heavy industries should immediately begin pilot programs evaluating green hydrogen for applications that cannot be directly electrified."
          }
        ]
      },
    ],
    sources: [
      { name: "International Energy Agency", url: "https://iea.org#:~:text=renewable%20energy%20investment" },
      { name: "BloombergNEF", url: "https://bnef.com#:~:text=solar%20energy%20costs" },
      { name: "Nature Energy Journal", url: "https://nature.com/energy#:~:text=perovskite%20solar%20cells" },
      { name: "Rocky Mountain Institute", url: "https://rmi.org#:~:text=green%20hydrogen" },
    ],
    generatedAt: new Date("2026-04-20"),
    researchTime: "3 min 12 sec",
  },
  "2": {
    id: "2",
    title: "Research Report: Global Supply Chain Trends",
    summary: "An in-depth analysis of evolving global supply chain dynamics, examining reshoring trends, digital transformation, and resilience strategies adopted by leading organizations in response to recent disruptions.",
    sections: [
      {
        title: "Key Findings",
        content: "72% of companies are actively diversifying their supplier base. Nearshoring to Mexico and Eastern Europe has increased by 40% since 2023. AI-powered demand forecasting is reducing inventory costs by 15-25% for early adopters.",
      },
      {
        title: "Market Analysis",
        content: "Supply chain technology investment is projected to reach $45 billion by 2027. Real-time visibility platforms are becoming standard, with 85% of large enterprises implementing track-and-trace solutions. Autonomous logistics and drone delivery are moving from pilot to scale.",
      },
      {
        title: "Risk Assessment",
        content: "Geopolitical tensions remain the top concern for supply chain leaders. Climate-related disruptions are increasing, with 60% of companies reporting weather-related supply issues in the past year. Cybersecurity vulnerabilities in interconnected supply chains present growing risks.",
      },
      {
        title: "Recommendations",
        content: "Build redundancy through multi-sourcing strategies. Invest in end-to-end visibility platforms. Develop scenario planning capabilities for major disruption events. Strengthen supplier relationships through collaborative planning and risk-sharing agreements.",
      },
    ],
    sources: [
      { name: "McKinsey Global Institute", url: "https://mckinsey.com#:~:text=supply%20chain%20resilience" },
      { name: "Gartner Supply Chain Research", url: "https://gartner.com#:~:text=real-time%20visibility" },
      { name: "World Trade Organization", url: "https://wto.org#:~:text=global%20trade%20flows" },
      { name: "MIT Supply Chain Management", url: "https://mit.edu#:~:text=demand%20forecasting" },
    ],
    generatedAt: new Date("2026-04-18"),
    researchTime: "2 min 45 sec",
  },
  "3": {
    id: "3",
    title: "Research Report: AI in Healthcare Analysis",
    summary: "A comprehensive examination of artificial intelligence applications in healthcare, covering diagnostic AI, drug discovery, clinical operations, and the regulatory landscape shaping adoption.",
    sections: [
      {
        title: "Key Findings",
        content: "AI diagnostic tools are achieving accuracy rates exceeding human specialists in radiology, pathology, and dermatology. Drug discovery timelines are being reduced by 30-50% through AI-powered compound screening. Administrative AI is automating 40% of clinical documentation tasks.",
      },
      {
        title: "Market Analysis",
        content: "Healthcare AI market is projected to reach $188 billion by 2030, growing at 37% CAGR. Major health systems are allocating 8-12% of IT budgets to AI initiatives. Venture investment in healthcare AI startups exceeded $15 billion in 2025.",
      },
      {
        title: "Regulatory Landscape",
        content: "FDA has approved over 500 AI-enabled medical devices. New regulatory frameworks are emerging for adaptive AI that learns from real-world data. Privacy concerns around health data are driving development of federated learning approaches.",
      },
      {
        title: "Recommendations",
        content: "Healthcare organizations should: (1) Start with high-impact, lower-risk use cases like administrative automation, (2) Establish AI governance frameworks addressing bias and explainability, (3) Invest in data infrastructure to support AI deployment, (4) Develop clinician training programs for AI-augmented workflows.",
      },
    ],
    sources: [
      { name: "New England Journal of Medicine", url: "https://nejm.org#:~:text=AI%20diagnostic%20tools" },
      { name: "FDA Digital Health Center", url: "https://fda.gov#:~:text=AI-enabled%20medical%20devices" },
      { name: "Stanford HAI", url: "https://hai.stanford.edu#:~:text=healthcare%20AI%20market" },
      { name: "WHO Digital Health", url: "https://who.int#:~:text=digital%20health%20governance" },
    ],
    generatedAt: new Date("2026-04-15"),
    researchTime: "4 min 08 sec",
  },
  "4": {
    id: "4",
    title: "Research Report: Cryptocurrency Regulations",
    summary: "An analysis of the evolving global regulatory landscape for cryptocurrencies and digital assets, examining major jurisdictional approaches, compliance requirements, and implications for market participants.",
    sections: [
      {
        title: "Key Findings",
        content: "Over 60 countries have now established comprehensive crypto regulatory frameworks. Central bank digital currencies (CBDCs) are in development or pilot phase in 130+ countries. DeFi protocols face increasing regulatory scrutiny with new compliance requirements emerging.",
      },
      {
        title: "Regional Analysis",
        content: "The EU Markets in Crypto-Assets (MiCA) regulation provides the most comprehensive framework globally. US regulatory approach remains fragmented between SEC and CFTC jurisdictions. Asia-Pacific markets show divergent approaches, from Singapore friendly stance to China restrictions.",
      },
      {
        title: "Compliance Requirements",
        content: "KYC/AML requirements are now standard for centralized exchanges globally. Travel rule implementation for crypto transfers is expanding. Stablecoin issuers face reserve and audit requirements in major jurisdictions. Tax reporting obligations are becoming more stringent.",
      },
      {
        title: "Recommendations",
        content: "Market participants should: (1) Implement robust compliance programs meeting highest jurisdictional standards, (2) Monitor regulatory developments across operating jurisdictions, (3) Engage with regulators through industry associations, (4) Prepare for increased institutional requirements as traditional finance integrates with crypto.",
      },
    ],
    sources: [
      { name: "Bank for International Settlements", url: "https://bis.org#:~:text=central%20bank%20digital%20currencies" },
      { name: "Financial Stability Board", url: "https://fsb.org#:~:text=crypto%20regulatory%20frameworks" },
      { name: "CoinDesk Research", url: "https://coindesk.com#:~:text=DeFi%20protocols" },
      { name: "Chainalysis Insights", url: "https://chainalysis.com#:~:text=KYC%20AML%20compliance" },
    ],
    generatedAt: new Date("2026-04-12"),
    researchTime: "2 min 58 sec",
  },
}

const mockRecentReports = [
  { id: "5", title: "Theoretical Frameworks of Antigravity", date: "Apr 27, 2026", status: "completed" as const },
  { id: "1", title: "Future of Renewable Energy", date: "Apr 20, 2026", status: "completed" as const },
  { id: "2", title: "Global Supply Chain Trends", date: "Apr 18, 2026", status: "completed" as const },
  { id: "3", title: "AI in Healthcare Analysis", date: "Apr 15, 2026", status: "completed" as const },
  { id: "4", title: "Cryptocurrency Regulations", date: "Apr 12, 2026", status: "completed" as const },
]

const activitySequence = [
  { type: "search" as const, message: "Initiating Google Search for top 10 most authentic research sources...", source: "Google Search Engine" },
  { type: "search" as const, message: "Identifying and verifying institutional authority (Brookings, CSIS, CFR, etc.)...", source: "Authenticity Protocol" },
  { type: "search" as const, message: "Extracting deep intelligence from Top 10 validated web repositories...", source: "Multi-Source Crawler" },
  { type: "read" as const, message: "Cross-referencing data across validated domains for structural consistency...", source: "Intelligence Validator" },
  { type: "analyze" as const, message: "Synthesizing multi-dimensional dossier from 10 most authentic sources...", source: "Neural Synthesis Engine" },
  { type: "complete" as const, message: "Analysis complete! Report generated using Top 10 globally recognized authentic sources." },
]

export default function DashboardPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [currentReport, setCurrentReport] = useState<Report | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Display either the selected historical report or the newly generated report
  const displayedReport = useMemo(() => {
    if (selectedReportId && mockReportsData[selectedReportId]) {
      return mockReportsData[selectedReportId]
    }
    return currentReport
  }, [selectedReportId, currentReport])

  const handleSelectReport = useCallback((id: string) => {
    setSelectedReportId(id)
    setActivities([]) // Clear activity log when viewing historical report
    setIsGeneratingReport(false)
    setIsSearching(false)
    
    // Push state to handle back button
    window.history.pushState({ reportId: id }, "")
  }, [])

  // Handle browser back button to close report
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we are moving back and a report was open, close it
      setSelectedReportId(null)
      setCurrentReport(null)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Helper to close report and sync history
  const closeReport = useCallback(() => {
    if (selectedReportId || currentReport) {
      setSelectedReportId(null)
      setCurrentReport(null)
      
      // Instead of back(), we just ensure the URL/State is clean
      // This prevents jumping out to Google
      if (window.history.state?.reportId) {
        // If we want to stay on the site but clear the "forward" history
        // the safest way is to replace the current state
        window.history.replaceState(null, "", "/")
      }
    }
  }, [selectedReportId, currentReport])

  const handleResearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setActivities([])
    setCurrentReport(null)
    setSelectedReportId(null)
    setIsGeneratingReport(false)

    // Start showing simulated progress activities while the real API works
    let currentIndex = 0
    const activityInterval = setInterval(() => {
      if (currentIndex < activitySequence.length - 1) {
        const activity = activitySequence[currentIndex]
        const newActivity: ActivityItem = {
          id: `activity-${Date.now()}-${currentIndex}`,
          ...activity,
          timestamp: new Date(),
          status: "active",
        }

        setActivities((prev) => {
          const updated = prev.map((a) => ({ ...a, status: "completed" as const }))
          return [...updated, newActivity]
        })
        currentIndex++
      } else {
        clearInterval(activityInterval)
      }
    }, 2500)

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : (errorData.error?.message || JSON.stringify(errorData.error) || "Research failed");
        throw new Error(errorMessage);
      }

      const reportData = await response.json()
      
      clearInterval(activityInterval)
      
      // Mark all activities as complete
      setActivities((prev) => {
        const finalActivity = activitySequence[activitySequence.length - 1]
        const updated = prev.map((a) => ({ ...a, status: "completed" as const }))
        return [...updated, {
          id: "complete",
          ...finalActivity,
          timestamp: new Date(),
          status: "completed"
        }]
      })

      setIsSearching(false)
      setIsGeneratingReport(true)
      
      // Smooth transition to report view
      setTimeout(() => {
        setIsGeneratingReport(false)
        setCurrentReport(reportData)
        // Push state for new report
        window.history.pushState({ reportId: 'new' }, "")
      }, 2000)

    } catch (error: any) {
      console.error("Research Error:", error)
      clearInterval(activityInterval)
      setIsSearching(false)
      setActivities((prev) => [
        ...prev,
        {
          id: "error",
          type: "analyze",
          message: error.message || "Research encountered an error. Please try again.",
          timestamp: new Date(),
          status: "completed",
          source: "System"
        }
      ])
    }
  }, [])


  const router = useRouter()
  const { data: session, status } = useSession()
  const [localSession, setLocalSession] = useState<boolean | null>(null)

  useEffect(() => {
    const sessionStr = localStorage.getItem("ag_session")
    setLocalSession(!!sessionStr)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated" && localSession === false) {
      router.replace("/login")
    }
  }, [status, localSession, router])

  if (status === "loading" || localSession === null || (status === "unauthenticated" && localSession === false)) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verifying session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <BackgroundBeams />
      
      {/* Fixed hamburger menu button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-6 left-6 z-30 p-3 rounded-xl bg-card/80 dark:bg-white/[0.03] backdrop-blur-md border border-border dark:border-white/10 shadow-2xl hover:bg-muted dark:hover:bg-white/[0.08] transition-all duration-300 group"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-muted-foreground dark:text-white/70 group-hover:text-foreground dark:group-hover:text-white transition-colors" />
      </motion.button>

      {/* Sidebar */}
      <ResearchSidebar
        reports={mockRecentReports}
        selectedReportId={selectedReportId}
        onSelectReport={handleSelectReport}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onHomeClick={closeReport}
      />
      
      {/* Main content - full width, centered */}
      <main className="relative z-10 w-full min-h-screen flex flex-col pt-12">
        {/* Header with logo and search */}
        <header className="w-full px-4 pt-4 pb-10 sm:px-6 lg:px-8 lg:pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            {/* Logo centered */}
            <div className="flex flex-col items-center justify-center gap-6 mb-12">
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative group cursor-pointer"
                onClick={() => {
                  closeReport();
                  setActivities([]);
                  setIsSearching(false);
                }}
              >
                {/* Background glow effect for the logo */}
                <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full group-hover:bg-cyan-500/50 transition-all duration-700 animate-pulse"></div>
                <Logo className="w-full h-full relative z-10 drop-shadow-[0_0_20px_rgba(0,210,255,0.6)] transform transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-[360deg]" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 dark:from-white dark:to-white/40">
                  Deep Research
                </h1>
                <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400/60 font-mono uppercase tracking-[0.4em] ml-1">
                  Synthetic Intelligence Agent
                </p>
              </div>
            </div>

            {/* Search bar */}
            <SearchBar onSearch={handleResearch} isSearching={isSearching} />
          </motion.div>
        </header>
        
        {/* Content area */}
        <div className="flex-1 w-full px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-10">
            <AnimatePresence mode="wait">
              {activities.length > 0 && (
                <ActivityLog key="activity-log" activities={activities} isActive={isSearching} />
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {displayedReport && (
                <motion.div
                  key={displayedReport.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                >
                  <ReportView 
                    report={displayedReport} 
                    isGenerating={isGeneratingReport} 
                    onBack={closeReport}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
