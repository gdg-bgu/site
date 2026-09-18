'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function TableOfContents({ sections }: { sections: { id: string; heading: string }[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ul className="space-y-1 border-l border-border">
        {sections.map((section) => {
          const active = section.id === activeId
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  '-ml-px block border-l-2 py-1.5 pl-4 leading-snug transition-colors',
                  active
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {section.heading}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
