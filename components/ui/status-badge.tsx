import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  value: number
  lowThreshold?: number
  mediumThreshold?: number
  className?: string
}

export function StatusBadge({ value, lowThreshold = 10, mediumThreshold = 50, className }: StatusBadgeProps) {
  let color = "bg-emerald-100 text-emerald-800 border border-emerald-200"

  if (value <= lowThreshold) {
    color = "bg-red-100 text-red-800 border border-red-200"
  } else if (value <= mediumThreshold) {
    color = "bg-amber-100 text-amber-800 border border-amber-200"
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm",
      color,
      className
    )}>
      {value}
    </span>
  )
}