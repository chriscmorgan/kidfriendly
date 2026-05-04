import { cn } from '@/lib/utils'
import { getTagMeta, getOpenTimeMeta } from '@/lib/utils'
import type { Tag, OpenTime } from '@/lib/types'

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

export function TagBadge({ tag }: { tag: Tag }) {
  const meta = getTagMeta(tag)
  return (
    <Badge color={meta.color} bgColor={meta.bgColor}>
      {meta.emoji} {meta.label}
    </Badge>
  )
}

export function OpenTimeBadge({ time }: { time: OpenTime }) {
  const meta = getOpenTimeMeta(time)
  return (
    <Badge color={meta.color} bgColor={meta.bgColor}>
      {meta.emoji} {meta.label}
    </Badge>
  )
}
