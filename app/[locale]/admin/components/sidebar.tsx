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
      name: 'Properties',
      href: `/${locale}/admin/properties`,
      icon: 'home',
      subItems: [
        {
          name: 'All Properties',
          href: `/${locale}/admin/properties`,
        },
        {
          name: 'Add Property',
          href: `/${locale}/admin/properties/new`,
        },
      ],
    },
    {
      name: 'Users',
      href: `/${locale}/admin/users`,
      icon: 'users',
      subItems: [
        {
          name: 'All Users',
          href: `/${locale}/admin/users`,
        },
        {
          name: 'Add User',
          href: `/${locale}/admin/users/new`,
        },
      ],
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
            
            {item.subItems && (
              <div className="pl-4 mt-1 space-y-1">
                {item.subItems.map(subItem => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      pathname === subItem.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className="truncate">- {subItem.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
