"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
  rightContent?: ReactNode
}

export function SectionHeading({ title, subtitle, className, rightContent }: SectionHeadingProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {rightContent && (
          <div className="ml-4">
            {rightContent}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
