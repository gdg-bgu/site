export type MemberRole = 'admin' | 'lead' | 'associate' | 'member'

export interface Member {
  id: string
  name: string
  email: string
  role: string
  systemRole: MemberRole
  avatar?: string
  isAllowed?: boolean
}

export const INITIAL_MEMBER_WHITELIST: Member[] = [
  {
    id: 'anshuman-praharaj',
    name: 'Anshuman Praharaj',
    email: 'anshuman.praharaj26@bgu.ac.in',
    role: 'GDGoC Organizer',
    systemRole: 'admin',
    avatar: '/team/anshuman.webp',
  },
  {
    id: 'solomon-shaan-nayak',
    name: 'Solomon Shaan Nayak',
    email: 'solomon.nayak26@bgu.ac.in',
    role: 'Design & Content Lead',
    systemRole: 'lead',
    avatar: '/team/solomon.webp',
  },
  {
    id: 'suvrajit-samanantasinghar',
    name: 'Suvrajit Samanantasinghar',
    email: 'suvrajit.samantasinghar26@bgu.ac.in',
    role: 'Technical Lead',
    systemRole: 'lead',
    avatar: '/team/suvrajit.webp',
  },
  {
    id: 'ayush-d-panigrahi',
    name: 'Ayush D Panigrahi',
    email: 'ayush.panigrahi28@bgu.ac.in',
    role: 'Event Management Lead',
    systemRole: 'lead',
    avatar: '/team/ayush-panigrahi.webp',
  },
  {
    id: 'shreya-mohanta',
    name: 'Shreya Mohanta',
    email: 'shreya.mohanta28@bgu.ac.in',
    role: 'Community Engagement Lead',
    systemRole: 'lead',
    avatar: '/team/shreya-mohanta.webp',
  },
  {
    id: 'aryan-panda',
    name: 'Aryan Panda',
    email: 'aryan.panda28@bgu.ac.in',
    role: 'Outreach & Growth Lead',
    systemRole: 'lead',
    avatar: '/team/aryan.webp',
  },
  {
    id: 's-karthick',
    name: 'S. KARTHICK',
    email: 's.karthick25ug101@bgu.ac.in',
    role: 'Lead Video Editor',
    systemRole: 'lead',
    avatar: '/team/karthick.webp',
  },
  {
    id: 't-pushkar-raj',
    name: 'Pushkar Raj',
    email: 't.raj25ug107@bgu.ac.in',
    role: 'Technical Associate',
    systemRole: 'associate',
    avatar: '/team/pushkar.jpeg',
  },
  {
    id: 'shreya-mohapatra',
    name: 'Shreya Mohapatra',
    email: 'shreya.mohapatra25ug107@bgu.ac.in',
    role: 'Event Management Associate',
    systemRole: 'associate',
    avatar: '/team/shreya-mohapatra.jpeg',
  },
  {
    id: 'ayush-mall',
    name: 'Ayush Mall',
    email: 'ayush.mall25ug107@bgu.ac.in',
    role: 'Design & Content Associate',
    systemRole: 'associate',
    avatar: '/team/ayush-mall.jpeg',
  },
]

export const MEMBER_WHITELIST = INITIAL_MEMBER_WHITELIST

export function sortMembers(members: Member[]): Member[] {
  const getRank = (m: Member) => {
    const idx = INITIAL_MEMBER_WHITELIST.findIndex(
      (init) =>
        init.id === m.id ||
        init.email.toLowerCase() === m.email.toLowerCase()
    )
    return idx !== -1 ? idx : 999
  }

  return [...members].sort((a, b) => getRank(a) - getRank(b))
}

export function isAllowedMemberSync(email: string | null | undefined): boolean {
  if (!email) return false
  const normalizedEmail = email.trim().toLowerCase()
  return INITIAL_MEMBER_WHITELIST.some((m) => m.email.toLowerCase() === normalizedEmail)
}

