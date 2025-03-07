import { cn } from "@/lib/utils"

interface GradientHeaderProps {
  title: string
  description?: string
  className?: string
}

export function GradientHeader({ title, description, className }: GradientHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg p-8 mb-6", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight gradient-heading">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>}
      </div>
    </div>
  )
}