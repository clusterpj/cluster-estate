"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Menu, Home, Building2, Info, Phone, User, LogOut } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from './language-switcher';
import { useAuth } from "@/components/providers/auth-provider";
import { useTranslations } from 'next-intl';

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


export function Header() {
  const { user, signOut, userProfile } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1];

  const localizedHref = (path: string) => `/${currentLocale}${path}`;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-transparent bg-gradient-to-b from-black/10 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Link href={localizedHref('/')} className="flex items-center space-x-2">
              <Image
                src="/cabarete-villas.png"
                alt="Cabarete Villas Logo"
                width={200}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Center Section: Navigation Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('nav.properties')}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <ListItem
                        href={localizedHref('/properties?type=villa')}
                        title="Villas"
                      >
                        Luxury villas with exclusive amenities and private spaces
                      </ListItem>
                      <ListItem
                        href={localizedHref('/properties?type=condo')}
                        title="Condos"
                      >
                        Modern condominiums with resort-style facilities
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/activities')} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {t('nav.activities')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/about')} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {t('nav.about')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/contact')} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {t('nav.contact')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Section: User Options */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Only show on mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-0 text-base hover:bg-transparent dark:hover:bg-transparent hover:text-accent-foreground md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <nav className="flex flex-col space-y-6 mt-6">
                  {/* Properties Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-lg font-semibold rounded-lg bg-accent/50">
                      <Building2 className="h-5 w-5" />
                      {t('nav.properties')}
                    </div>
                    <div className="ml-4 flex flex-col space-y-3">
                      <Link
                        href={localizedHref('/properties?type=villa')}
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Villas</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Luxury villas with exclusive amenities and private spaces</span>
                      </Link>
                      <Link
                        href={localizedHref('/properties?type=condo')}
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Condos</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Modern condominiums with resort-style facilities</span>
                      </Link>
                    </div>
                  </div>

                  {/* Other Mobile Menu Items */}
                  <Link href={localizedHref('/activities')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent">
                    <Home className="h-5 w-5" />
                    {t('nav.activities')}
                  </Link>
                  <Link href={localizedHref('/about')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent">
                    <Info className="h-5 w-5" />
                    {t('nav.about')}
                  </Link>
                  <Link href={localizedHref('/contact')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent">
                    <Phone className="h-5 w-5" />
                    {t('nav.contact')}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Auth, Theme, Language */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-transparent dark:hover:bg-transparent">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('auth.userMenu')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile?.full_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userProfile?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={localizedHref('/admin')}>
                          {t('auth.adminDashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={localizedHref('/dashboard')}>
                      {t('auth.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localizedHref('/profile')}>
                      {t('auth.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="hover:bg-transparent dark:hover:bg-transparent" asChild>
                  <Link href={localizedHref('/auth/login')}>
                    {t('auth.signIn')}
                  </Link>
                </Button>
                <Button variant="ghost" className="hover:bg-transparent dark:hover:bg-transparent" asChild>
                  <Link href={localizedHref('/auth/register')}>
                    {t('auth.signUp')}
                  </Link>
                </Button>
              </div>
            )}
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
