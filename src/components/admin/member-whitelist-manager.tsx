'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Users, UserPlus, Trash2, ShieldCheck, Award, Sparkles, Search } from 'lucide-react'
import { Member } from '@/lib/members'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { removeMemberAction } from '@/app/actions/member-actions'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
}

type CategoryKey = 'admin' | 'lead' | 'associate' | 'member'

const CATEGORY_CONFIG: Record<CategoryKey, {
  title: string
  description: string
  badge: string
  badgeStyle: string
  icon: typeof ShieldCheck
  iconColor: string
}> = {
  admin: {
    title: 'Organizers & Admins',
    description: 'Core leadership and community organizers',
    badge: 'Organizer',
    badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    icon: ShieldCheck,
    iconColor: 'text-amber-500',
  },
  lead: {
    title: 'Domain Leads',
    description: 'Track leads managing technical, design & outreach domains',
    badge: 'Lead',
    badgeStyle: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    icon: Award,
    iconColor: 'text-blue-500',
  },
  associate: {
    title: 'Associates',
    description: 'Team associates supporting domain execution and content',
    badge: 'Associate',
    badgeStyle: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    icon: Sparkles,
    iconColor: 'text-purple-500',
  },
  member: {
    title: 'Team Members',
    description: 'Authorized community members',
    badge: 'Member',
    badgeStyle: 'bg-muted text-muted-foreground border-border',
    icon: Users,
    iconColor: 'text-muted-foreground',
  },
}

function getMemberCategoryKey(member: Member): CategoryKey {
  const roleLower = (member.role || '').toLowerCase()
  const sysRole = member.systemRole

  if (sysRole === 'admin' || roleLower.includes('organizer') || roleLower.includes('admin')) {
    return 'admin'
  }
  if (sysRole === 'lead' || roleLower.includes('lead')) {
    return 'lead'
  }
  if (sysRole === 'associate' || roleLower.includes('associate')) {
    return 'associate'
  }
  return 'member'
}

export function MemberWhitelistManager({
  members,
  currentUserEmail,
  currentUserRole,
}: {
  members: Member[]
  currentUserEmail?: string
  currentUserRole?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin = currentUserRole === 'admin'

  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q)
    )
  })

  const categoryOrder: CategoryKey[] = ['admin', 'lead', 'associate', 'member']

  const groupedMembers = categoryOrder.reduce((acc, key) => {
    acc[key] = filteredMembers.filter((m) => getMemberCategoryKey(m) === key)
    return acc
  }, {} as Record<CategoryKey, Member[]>)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Authorized Team Members
            <span className="ml-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              {members.length}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organized by role hierarchy and system permissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs rounded-full bg-background"
            />
          </div>

          {isAdmin && (
            <Button asChild size="sm" className="gap-2 rounded-full shadow-xs">
              <Link href="/admin/members/add">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Hierarchical Group Sections */}
      <div className="space-y-8">
        {categoryOrder.map((key) => {
          const categoryList = groupedMembers[key]
          if (!categoryList || categoryList.length === 0) return null

          const config = CATEGORY_CONFIG[key]
          const SectionIcon = config.icon

          return (
            <div key={key} className="space-y-3">
              {/* Category Subheader */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-muted/60 ${config.iconColor}`}>
                    <SectionIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground tracking-tight">
                        {config.title}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {categoryList.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {categoryList.map((member) => {
                  const isCurrentUser = currentUserEmail?.toLowerCase() === member.email.toLowerCase()

                  return (
                    <div
                      key={member.id || member.email}
                      className={`group relative flex items-start gap-3.5 rounded-xl border p-4 transition-all bg-card shadow-2xs hover:shadow-md ${isCurrentUser
                          ? 'border-primary/60 ring-2 ring-primary/10 bg-primary/[0.02]'
                          : 'border-border/80 hover:border-primary/40'
                        }`}
                    >
                      <Avatar className="h-11 w-11 shrink-0 border border-border/80 shadow-xs">
                        {member.avatar && (
                          <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-bold text-foreground leading-snug">
                            {member.name}
                          </p>
                          {isCurrentUser && (
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                              You
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold ${config.badgeStyle}`}
                          >
                            {config.badge}
                          </span>
                        </div>

                        <p className="truncate text-[11px] font-medium text-muted-foreground">
                          {member.role}
                        </p>

                        <p className="truncate text-[10px] text-muted-foreground/80 font-mono">
                          {member.email}
                        </p>
                      </div>

                      {isAdmin && !isCurrentUser && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          title="Remove member"
                          disabled={isPending}
                          onClick={() => {
                            if (confirm(`Remove ${member.name} (${member.email}) from the team?`)) {
                              startTransition(async () => {
                                await removeMemberAction(member.email)
                              })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredMembers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No team members match "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

