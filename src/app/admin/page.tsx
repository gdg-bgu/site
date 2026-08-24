import Link from "next/link"
import { PenSquare, ArrowRight, ShieldCheck, Info } from "lucide-react"
import { StatCards } from "@/components/admin/stat-cards"
import { BlogTable } from "@/components/admin/blog-table"
import { MemberWhitelistManager } from "@/components/admin/member-whitelist-manager"
import { getAllBlogs } from "@/lib/blog-db"
import { getAllMembers } from "@/lib/members-db"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSession } from "@/lib/auth"
import { LogoutButton } from "@/components/admin/logout-button"

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  const user = session?.user
  const firstName = user?.name ? user.name.split(' ')[0] : 'Member'

  const allBlogs = await getAllBlogs()
  const members = await getAllMembers()

  const recent = [...allBlogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner & Welcome Section */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {user?.name ? getInitials(user.name) : 'MB'}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {firstName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active Session
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.role || 'GDG Member'} <br /> <span className="font-mono text-xs">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LogoutButton variant="outline" />
          <Button asChild className="gap-2 rounded-full shadow-sm">
            <Link href="/admin/create">
              <PenSquare style={{ width: 16, height: 16 }} />
              Write new blog
            </Link>
          </Button>
        </div>
      </div>

      <StatCards blogs={allBlogs} />

      <MemberWhitelistManager
        members={members}
        currentUserEmail={user?.email}
        currentUserRole={user?.systemRole}
      />

      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <BlogTable blogs={recent} title="Latest posts" />
    </div>
  )
}
