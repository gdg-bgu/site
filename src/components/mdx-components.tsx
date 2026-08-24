import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Callout({
  type = 'info',
  title,
  children,
  className,
}: {
  type?: 'info' | 'tip' | 'warning' | 'danger'
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
    tip: <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
    danger: <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />,
  }

  const styles = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200',
    tip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200',
  }

  return (
    <div
      className={cn(
        'my-6 flex gap-3.5 rounded-2xl border p-4.5 text-sm leading-relaxed shadow-xs',
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 text-base leading-snug">{title}</h5>}
        <div className="[&>p]:my-0">{children}</div>
      </div>
    </div>
  )
}

export function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('my-6 rounded-2xl border border-primary/20 bg-primary/5 p-4.5 text-sm text-foreground/90', className)}>
      <div className="flex items-center gap-2 font-semibold text-primary mb-1">
        <CheckCircle2 className="h-4 w-4" />
        Note
      </div>
      <div>{children}</div>
    </div>
  )
}

export const mdxComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'mt-10 mb-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'mt-10 mb-4 text-balance text-2xl font-semibold tracking-tight text-foreground border-b border-border/50 pb-2.5',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'mt-8 mb-3 text-balance text-xl font-semibold tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('mt-4 text-[17px] leading-8 text-foreground/85', className)} {...props} />
  ),
  a: ({ className, href = '#', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isInternal = href.startsWith('/') || href.startsWith('#')
    if (isInternal) {
      return (
        <Link
          href={href}
          className={cn('font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity', className)}
          {...props}
        />
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity', className)}
        {...props}
      />
    )
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('my-5 list-disc pl-6 text-[17px] leading-8 text-foreground/85 space-y-1.5', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-5 list-decimal pl-6 text-[17px] leading-8 text-foreground/85 space-y-1.5', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'my-6 border-l-4 border-primary/80 pl-5 italic text-foreground/90 font-serif text-lg bg-secondary/30 py-3 pr-4 rounded-r-xl',
        className
      )}
      {...props}
    />
  ),
  img: ({ className, alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="my-6 block overflow-hidden rounded-2xl border border-border shadow-sm">
      <img
        src={src}
        alt={alt || ''}
        className={cn('w-full object-cover max-h-[500px]', className)}
        {...props}
      />
      {alt && <span className="block p-2.5 text-center text-xs text-muted-foreground bg-muted/30">{alt}</span>}
    </span>
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('bg-muted/50 p-3.5 font-semibold text-foreground border-b border-border', className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('p-3.5 border-b border-border/50 text-foreground/85', className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        'my-6 overflow-x-auto rounded-2xl border border-border bg-muted/80 p-4 text-sm font-mono text-foreground leading-relaxed',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn('rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground font-semibold', className)}
      {...props}
    />
  ),
  Callout,
  Note,
}
