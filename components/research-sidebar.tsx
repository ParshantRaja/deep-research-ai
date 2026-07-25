"use client"

import { useEffect, useState } from "react"
import { Clock, ChevronRight, X, Settings, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RecentReport {
  id: string
  title: string
  date: string
  status: "completed" | "in-progress"
}

interface ResearchSidebarProps {
  reports: RecentReport[]
  selectedReportId: string | null
  onSelectReport: (id: string) => void
  isOpen: boolean
  onClose: () => void
  onHomeClick?: () => void
}

export function ResearchSidebar({
  reports,
  selectedReportId,
  onSelectReport,
  isOpen,
  onClose,
  onHomeClick
}: ResearchSidebarProps) {

  const { data: session } = useSession()
  const [user, setUser] = useState({ name: "", email: "", initials: "" })
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    if (session?.user) {
      const name = session.user.name || session.user.email?.split("@")[0] || "User"
      const email = session.user.email || ""
      const initials = name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
      setUser({ name, email, initials })
      setEditedName(name)
    } else {
      try {
        const localSess = JSON.parse(localStorage.getItem("ag_session") || "{}")
        const name = localSess.name || localSess.email?.split("@")[0] || "User"
        const email = localSess.email || ""
        const initials = name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
        setUser({ name, email, initials })
        setEditedName(name)
      } catch {
        setUser({ name: "User", email: "", initials: "U" })
        setEditedName("User")
      }
    }
  }, [session])

  const handleUpdateProfile = () => {
    try {
      const session = JSON.parse(localStorage.getItem("ag_session") || "{}")
      const updatedSession = { ...session, name: editedName }
      localStorage.setItem("ag_session", JSON.stringify(updatedSession))
      
      const initials = editedName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
      
      setUser({ ...user, name: editedName, initials })
      toast.success("Profile updated", { description: "Your display name has been saved." })
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleLogout = async () => {
    toast("Logging out...", { description: "See you next time!" })
    localStorage.removeItem("ag_session")
    if (session) {
      await signOut({ callbackUrl: "/login" })
    } else {
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
  }

  return (
    <>
      {/* --- FIXED OVERLAY: Ab ye piche ka area dark black karega --- */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar - slides in from left */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-50 w-80 transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <button 
            onClick={() => {
              onHomeClick?.();
              onClose();
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 flex items-center justify-center relative group">
               <div className="absolute inset-0 bg-primary/10 blur-md rounded-full group-hover:bg-primary/20 transition-colors duration-300"></div>
               <Logo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">Deep Research</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">AI-Powered Agent</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Reports list */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Recent Reports
            </h2>
          </div>

          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => {
                  onSelectReport(report.id)
                  onClose()
                }}
                className={cn(
                  "w-full text-left rounded-lg p-3 transition-all duration-150 group",
                  "hover:bg-sidebar-accent",
                  selectedReportId === report.id
                    ? "bg-sidebar-accent border border-sidebar-border"
                    : "border border-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-sidebar-foreground line-clamp-1">
                    {report.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    report.status === "completed" ? "bg-accent" : "bg-primary animate-pulse"
                  )} />
                </div>
              </button>
            ))}
          </div>
        </div>



        {/* Footer / User Profile */}
        <div className="border-t border-sidebar-border p-4 bg-sidebar flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm border border-primary/30">
                {user.initials || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground tracking-tight">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors group"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-sidebar-border/50">
            <p className="text-xs text-muted-foreground/70 font-medium">
              v1.0.0 — Deep Research
            </p>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors border border-transparent hover:border-border" 
                    aria-label="Settings"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                      Manage your account settings, preferences, and security.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="general" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Appearance</h4>
                          <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                        </div>
                        <ThemeToggle />
                      </div>
                    </TabsContent>
                    <TabsContent value="account" className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Display Name</label>
                        <input 
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-primary" 
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                        />
                      </div>
                      {editedName !== user.name && (
                        <button 
                          onClick={handleUpdateProfile}
                          className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                          Save Changes
                        </button>
                      )}
                      <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium">Connected Email</label>
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border shadow-sm">
                              <span className="text-xs font-bold">{user.initials?.[0] || "U"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.email}</span>
                              <span className="text-xs text-primary font-medium">Email Account</span>
                            </div>
                          </div>
                          <button className="text-xs text-muted-foreground hover:text-foreground font-medium hover:underline transition-colors">Change</button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="security" className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">Change Password</h4>
                          <p className="text-sm text-muted-foreground">Update your password or enable 2FA.</p>
                        </div>
                        <button className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md hover:bg-secondary/80 font-medium transition-colors">Update</button>
                      </div>
                      <div className="pt-4 border-t border-border mt-2">
                        <h4 className="text-sm font-medium mb-3">Active Sessions</h4>
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-background">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">Windows PC • Chrome</span>
                              <span className="text-xs text-muted-foreground">Current Session • Karachi, PK</span>
                            </div>
                          </div>
                          <button className="text-xs text-destructive font-medium hover:underline transition-colors">Revoke</button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}