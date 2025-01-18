'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Locale } from '@/config/i18n'

interface SidebarProps {
  locale: Locale
}

export function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: `/${locale}/admin`,
      icon: 'dashboard',
    },
    {
      name: 'Bookings',
      href: `/${locale}/admin/bookings`,
      icon: 'calendar',
    },
    {
      name: 'Calendar',
      href: `/${locale}/admin/calendar`,
      icon: 'calendar-days',
    },
    {
      name: 'Properties',
      href: `/${locale}/admin/properties`,
      icon: 'home',
    },
    {
      name: 'Users',
      href: `/${locale}/admin/users`,
      icon: 'users',
    },
  ]

  return (
    <div className="w-64 border-r h-screen p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="truncate">{item.name}</span>
            </Link>
            
          </div>
        ))}
      </nav>
    </div>
  )
}
