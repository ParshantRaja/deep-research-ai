"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import Link from "next/link"
// Firebase client-side imports removed — using secure server-side APIs instead

import { ThemeToggle } from "@/components/theme-toggle"

type AuthMode = "signin" | "signup" | "reset"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin")
  const [resetStep, setResetStep] = useState<"email" | "otp" | "new_password">("email")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })

  // Reset loading states when page is shown (handles browser back button)
  useEffect(() => {
    setLoading(false)
    setGoogleLoading(false)
    
    // Also reset if window gets focus again
    const handleFocus = () => {
      setGoogleLoading(false)
      setLoading(false)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Auto-redirect if already logged in
  if (status === "authenticated") {
    router.replace("/")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [isVerifying, setIsVerifying] = useState(false)
  const [otp, setOtp] = useState("")
  const [sentOtp, setSentOtp] = useState("")

  // Helper for password reset (reads from localStorage)
  const getUsers = (): Record<string, { password: string; name: string }> => {
    try {
      return JSON.parse(localStorage.getItem("ag_users") || "{}")
    } catch {
      return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (mode === "signup") {
      // Validate
      if (form.password !== form.confirm) {
        toast.error("Passwords do not match")
        setLoading(false)
        return
      }
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      try {
        // Call server-side API (uses Firebase Admin — no permission issues)
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 15000)

        const res = await fetch("/api/auth/register/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name, password: form.password }),
          signal: controller.signal,
        })

        clearTimeout(id)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Failed to send email")

        setIsVerifying(true)
        toast.success(`Verification code sent to ${form.email}`)
      } catch (error: any) {
        if (error.name === "AbortError") {
          toast.error("Email service timed out. Please try again.")
        } else {
          toast.error(`Error: ${error.message}`)
        }
      }
    } else {
      try {
        // Call server-side login API (uses Firebase Admin — no permission issues)
        const emailKey = form.email.toLowerCase().trim()
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || "Sign in failed")
          setLoading(false)
          return
        }

        localStorage.setItem(
          "ag_session",
          JSON.stringify({ email: emailKey, name: data.user.name, provider: "email" })
        )
        toast.success("Signed in successfully!")
        window.location.replace("/")
      } catch (error: any) {
        toast.error(`Sign in error: ${error.message}`)
      }
    }
    setLoading(false)
  }

  const handleResetSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    
    const users = getUsers();
    const emailKey = form.email.toLowerCase().trim();
    if (!users[emailKey]) {
      toast.error("No account found with this email.");
      setLoading(false);
      return;
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(code);
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      if (!res.ok) throw new Error();
      setResetStep("otp");
      toast.success(`Reset code sent to ${form.email}`);
    } catch {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== sentOtp) {
      toast.error("Invalid verification code. Please try again.");
      return;
    }
    setResetStep("new_password");
    setForm(p => ({ ...p, password: "", confirm: "" }));
    toast.success("Code verified.");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const users = getUsers();
    const emailKey = form.email.toLowerCase().trim();
    if (users[emailKey]) {
      users[emailKey].password = form.password;
      localStorage.setItem("ag_users", JSON.stringify(users));
      toast.success("Password reset successfully! Please sign in.");
      setMode("signin");
      setForm(p => ({ ...p, password: "", confirm: "" }));
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call server-side verify API (verifies OTP + registers user using Firebase Admin)
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Verification failed")
        setLoading(false)
        return
      }

      const emailKey = form.email.toLowerCase().trim()
      localStorage.setItem(
        "ag_session",
        JSON.stringify({ email: emailKey, name: data.user.name, provider: "email" })
      )
      toast.success("Account verified and created successfully!")
      setIsVerifying(false)
      window.location.replace("/")
    } catch (error: any) {
      toast.error(`Verification error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      // Use redirect: false to handle navigation manually or ensure it replaces history
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      toast.error("Failed to sign in with Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-500 relative overflow-hidden">
      {/* Universal Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2300d2ff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 dark:opacity-10 pointer-events-none" />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content Container */}
      <div className="flex w-full relative z-10">
        {/* Left Branding Side */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
              <Logo className="w-14 h-14 drop-shadow-[0_0_20px_rgba(0,210,255,0.7)]" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Deep Research</h1>
              <p className="text-cyan-500 text-[10px] font-mono font-medium tracking-[0.3em] uppercase">Intelligence Engine</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Intelligence at<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              the Speed of Thought
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            Access AI-powered deep research, comprehensive reports, and real-time insights across any domain.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 text-left">
            {[
              "Multi-source intelligence gathering",
              "Professional PDF report export",
              "Real-time research analytics",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border shadow-sm">
                <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="text-foreground/80 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <Logo className="w-8 h-8" />
          <span className="text-foreground font-semibold text-lg">Deep Research</span>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/5 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === "signin"
                  ? "Sign in to access your research dashboard"
                  : mode === "signup"
                  ? "Start your AI research journey today"
                  : "Follow the steps to reset your password"}
              </p>
            </div>

            {/* Google Button */}
            {mode !== "reset" && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all duration-200 text-foreground text-sm font-medium mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {googleLoading ? "Connecting..." : `Continue with Google`}
                </button>

                {/* Divider */}
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground/50 text-xs font-medium uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {/* Form */}
            {mode === "reset" ? (
              resetStep === "email" ? (
                <form onSubmit={handleResetSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground/80 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground text-sm outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-60 group mt-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
                  </button>
                  <button type="button" onClick={() => setMode("signin")} className="w-full text-muted-foreground text-xs font-medium hover:text-foreground mt-4">Back to Sign In</button>
                </form>
              ) : resetStep === "otp" ? (
                <form onSubmit={handleResetVerifyOtp} className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <label className="text-foreground/80 text-sm font-medium">Verify your email</label>
                    <p className="text-muted-foreground text-xs mb-4">Enter the 6-digit code sent to <span className="text-cyan-500">{form.email}</span></p>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground text-3xl text-center font-mono tracking-[0.5em] outline-none focus:border-cyan-500/60 transition-all duration-200"
                    />
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20">
                    Verify Code
                  </button>
                  <button type="button" onClick={() => setMode("signin")} className="w-full text-muted-foreground text-xs font-medium hover:text-foreground mt-4">Cancel Reset</button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-foreground/80 text-sm font-medium">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="off"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground text-sm outline-none focus:border-cyan-500/60 transition-all duration-200"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-foreground/80 text-sm font-medium">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="confirm"
                        type={showConfirm ? "text" : "password"}
                        required
                        autoComplete="off"
                        value={form.confirm}
                        onChange={handleChange}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground text-sm outline-none focus:border-cyan-500/60 transition-all duration-200"
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold transition-all shadow-lg mt-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                  </button>
                </form>
              )
            ) : isVerifying ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-1.5 text-center">
                  <label className="text-foreground/80 text-sm font-medium">Verify your email</label>
                  <p className="text-muted-foreground text-xs mb-4">
                    Enter the 6-digit code sent to <span className="text-cyan-500">{form.email}</span>
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoComplete="off"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-4 text-foreground text-3xl text-center font-mono tracking-[0.5em] placeholder:text-muted-foreground/30 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-full text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
                >
                  Back to Sign Up
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-foreground/80 text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder=""
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground text-sm outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-foreground/80 text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="off"
                      placeholder=""
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground text-sm outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-foreground/80 text-sm font-medium">Password</label>
                    {mode === "signin" && (
                      <button 
                        type="button" 
                        onClick={() => { setMode("reset"); setResetStep("email"); setForm({ ...form, password: "", confirm: "" }); }}
                        className="text-cyan-500 text-xs font-medium hover:text-cyan-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground text-sm placeholder:text-muted-foreground/30 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-foreground/80 text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        name="confirm"
                        type={showConfirm ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={form.confirm}
                        onChange={handleChange}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground text-sm placeholder:text-muted-foreground/30 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2 group"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle mode */}
            {mode !== "reset" && (
              <p className="text-center text-slate-500 text-sm mt-6">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setForm({ name: "", email: "", password: "", confirm: "" }) }}
                  className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                >
                  {mode === "signin" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs mt-6">
            By continuing, you agree to our{" "}
            <Link 
              href="/terms" 
              className="text-slate-500 hover:text-cyan-400 underline underline-offset-4 cursor-pointer transition-colors"
            >
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link 
              href="/privacy" 
              className="text-slate-500 hover:text-cyan-400 underline underline-offset-4 cursor-pointer transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
