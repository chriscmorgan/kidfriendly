import { cn } from '@/lib/utils'
import { getCategoryMeta } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  color?: string
  bgColor?: string
}

export function Badge({ children, className, color, bgColor }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        color,
        bgColor,
        className
      )}
    >
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  const meta = getCategoryMeta(category)
  return (
    <Badge color={meta.color} bgColor={meta.bgColor}>
      {meta.emoji} {meta.label}
    </Badge>
  )
}
