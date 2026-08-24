'use client'

import React, { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react'
import { loginAction } from '@/app/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SiteNavbar } from '@/components/site-navbar'
import { SiteFooter } from '@/components/site-footer'

function GoogleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const urlError = searchParams.get('error')

  const getInitialError = () => {
    if (!urlError) return null
    if (urlError === 'AccessDenied') {
      return 'Access Denied: Your Google account is not in the authorized member list.'
    }
    return `Authentication error: ${urlError}`
  }

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(getInitialError)
  const [isPending, startTransition] = useTransition()

  const handleGoogleSignIn = () => {
    setError(null)
    signIn('google', { callbackUrl })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('callbackUrl', callbackUrl)
      const res = await loginAction(formData)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Member Access Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your official BGU Google account to access the Admin Console.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Access Denied</p>
            <p className="text-xs opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="button"
          disabled={isPending}
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-xl font-semibold gap-3 bg-card text-foreground border border-border hover:bg-accent/60 shadow-xs transition-all hover:shadow-md"
        >
          <GoogleIcon />
          <span>Sign in with Google (BGU Account)</span>
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading login portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  )
}

