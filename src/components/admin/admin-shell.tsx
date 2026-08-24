'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  Archive,
  FileEdit,
  FileText,
  LayoutDashboard,
  Menu,
  PenSquare,
  LogOut,
  ExternalLink,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { GdgLogo } from '@/components/gdg-logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Member } from '@/lib/members'
import { signOut } from 'next-auth/react'
import { logoutAction } from '@/app/actions/auth-actions'

const nav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, match: (p: string, s: string) => p === '/admin' },
  { label: 'Create Blog', href: '/admin/create', icon: PenSquare, match: (p: string) => p === '/admin/create' },
  {
    label: 'All Blogs',
    href: '/admin/blogs',
    icon: FileText,
    match: (p: string, s: string) => p === '/admin/blogs' && !s,
  },
  {
    label: 'Drafts',
    href: '/admin/blogs?status=Draft',
    icon: FileEdit,
    match: (p: string, s: string) => p === '/admin/blogs' && s === 'Draft',
  },
  {
    label: 'Archived',
    href: '/admin/blogs?status=Archived',
    icon: Archive,
    match: (p: string, s: string) => p === '/admin/blogs' && s === 'Archived',
  },
]

function SidebarContent({ user, onNavigate }: { user?: Member | null; onNavigate?: () => void }) {
  const pathname = usePathname()
  const status = useSearchParams().get('status') ?? ''
  const [isPending, startTransition] = useTransition()

  const isAdmin = user?.systemRole === 'admin'

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      await signOut({ callbackUrl: '/login' })
    })
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
    : 'MB'

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link href="/" onClick={onNavigate}>
          <GdgLogo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Content
        </p>
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname, status)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administration
            </p>
            <Link
              href="/admin/members/add"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === '/admin/members/add'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-primary hover:bg-primary/10',
              )}
            >
              <UserPlus className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              Add Member
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Link href="/" onClick={onNavigate}>
            <ExternalLink style={{ width: 18, height: 18 }} />
            View live site
          </Link>
        </Button>

        <div className="flex items-center justify-between rounded-xl bg-sidebar-accent/50 p-3 border border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0 border border-primary/20">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-foreground">
                {user?.name || 'Authorized Member'}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user?.role || 'GDG Member'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export function AdminShell({ user, children }: { user?: Member | null; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="min-h-dvh bg-secondary/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent user={user} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-sidebar">
            <SidebarContent user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-accent lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-sm font-medium text-muted-foreground">Admin Console</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Member Protected
            </span>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/admin/create">
              <PenSquare style={{ width: 16, height: 16 }} />
              New blog
            </Link>
          </Button>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  )
}
