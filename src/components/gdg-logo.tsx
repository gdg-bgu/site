import { cn } from '@/lib/utils'
import Image from 'next/image'

export function GdgLogo({ className }: { className?: string }) {
  return (
    <div className='flex items-center gap-1'>
      <Image src='/logo.png' width={40} height={40} alt='logo' />
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-foreground">GDG On Campus</span>
        <span className="text-[11px] font-medium text-muted-foreground">Birla Global University</span>
      </span>
    </div>
  )
}
