import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="logo-gradient-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Glow Hexagon */}
      <polygon
        points="50 5, 89 27.5, 89 72.5, 50 95, 11 72.5, 11 27.5"
        fill="none"
        stroke="url(#logo-gradient-glow)"
        strokeWidth="6"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Inner sharp Hexagon */}
      <polygon
        points="50 12, 83 31, 83 69, 50 88, 17 69, 17 31"
        fill="none"
        stroke="url(#logo-gradient)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Center abstract shapes (representing data / AI) */}
      <circle cx="50" cy="50" r="16" fill="url(#logo-gradient)" />
      
      <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary/50" />
      
      {/* Nodes on the dashed circle */}
      <circle cx="50" cy="24" r="4" fill="currentColor" className="text-primary" />
      <circle cx="72.5" cy="63" r="3" fill="currentColor" className="text-primary" />
      <circle cx="27.5" cy="63" r="3" fill="currentColor" className="text-primary" />

      {/* Connection Lines to Center */}
      <line x1="50" y1="24" x2="50" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      <line x1="72.5" y1="63" x2="63" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      <line x1="27.5" y1="63" x2="37" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
    </svg>
  )
}
