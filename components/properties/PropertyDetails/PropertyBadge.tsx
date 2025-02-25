"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PropertyBadgeProps extends BadgeProps {
  color?: "primary" | "secondary" | "accent" | "muted"
  label: string
}

export function PropertyBadge({ color = "primary", label, className, ...props }: PropertyBadgeProps) {
  const colorClasses = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    accent: "bg-[#FF5A5F] hover:bg-[#E04A50] text-white",
    muted: "bg-muted hover:bg-muted/90 text-muted-foreground"
  }
  
  return (
    <Badge 
      className={cn(colorClasses[color], "font-medium text-xs px-3 py-1", className)} 
      {...props}
    >
      {label}
    </Badge>
  )
}