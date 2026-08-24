import type { Author } from '@/lib/blog-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function AuthorTag({
  author,
  size = 'sm',
  showRole = false,
}: {
  author: Author
  size?: 'sm' | 'lg'
  showRole?: boolean
}) {
  const avatarSrc = author.avatar || author.image

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className={cn(size === 'lg' ? 'h-10 w-10' : 'h-7 w-7')}>
        {avatarSrc && <AvatarImage src={avatarSrc} alt={author.name} />}
        <AvatarFallback
          className="text-xs font-semibold text-white"
          style={{ backgroundColor: author.color }}
        >
          {author.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <span className={cn('font-medium text-foreground', size === 'lg' ? 'text-sm' : 'text-xs')}>
          {author.name}
        </span>
        {showRole && <span className="text-xs text-muted-foreground">{author.role}</span>}
      </div>
    </div>
  )
}
