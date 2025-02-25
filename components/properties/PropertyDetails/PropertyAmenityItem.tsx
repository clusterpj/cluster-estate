"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PropertyAmenityItemProps {
  icon: ReactNode
  label: string
  className?: string
}

export function PropertyAmenityItem({ icon, label, className }: PropertyAmenityItemProps) {
  return (
    <div className={cn("flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg", className)}>
      <div className="text-primary flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  )
}