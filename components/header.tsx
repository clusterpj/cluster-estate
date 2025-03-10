"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Home, Building2, Info, Phone, User, LogOut, Shield, Settings } from "lucide-react";
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-transparent hover:text-gray-900 dark:hover:text-white",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">{title}</div>
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
  const { user, signOut, userProfile, refreshProfile } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1];
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();

  const localizedHref = (path: string) => `/${currentLocale}${path}`;
  
  // Function to close the mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Check if user is admin
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (userProfile) {
        console.log('Header - User profile loaded:', userProfile);
        // Check for both exact match and case-insensitive match
        const hasAdminRole = userProfile.role === 'admin' || 
                            (typeof userProfile.role === 'string' && 
                             userProfile.role.toLowerCase() === 'admin');
        
        console.log('Header - Admin role check:', { 
          role: userProfile.role,
          isAdmin: hasAdminRole 
        });
        
        setIsAdmin(hasAdminRole);
      } else if (user) {
        console.log('Header - User exists but no profile loaded. Refreshing profile...');
        // If we have a user but no profile, try to refresh the profile
        const profile = await refreshProfile();
        
        if (profile) {
          console.log('Header - Profile refreshed successfully:', profile);
          const hasAdminRole = profile.role === 'admin' || 
                              (typeof profile.role === 'string' && 
                               profile.role.toLowerCase() === 'admin');
          
          console.log('Header - Admin role check after refresh:', {
            role: profile.role,
            isAdmin: hasAdminRole
          });
          
          setIsAdmin(hasAdminRole);
        } else {
          console.log('Header - Profile refresh failed, checking directly...');
          // If refresh failed, try to check the profile directly
          try {
            const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
            const supabase = createClientComponentClient();
            
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            
            if (!error && profile) {
              const hasAdminRole = profile.role === 'admin' || 
                                  (typeof profile.role === 'string' && 
                                   profile.role.toLowerCase() === 'admin');
              
              console.log('Header - Direct profile check:', {
                role: profile.role,
                isAdmin: hasAdminRole
              });
              
              setIsAdmin(hasAdminRole);
            } else {
              console.log('Header - Direct profile check failed:', error);
              setIsAdmin(false);
            }
          } catch (err) {
            console.error('Error checking admin role:', err);
            setIsAdmin(false);
          }
        }
      } else {
        console.log('Header - No user or profile loaded');
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [userProfile, user, refreshProfile]);
  
  // Custom Link component that closes the menu when clicked
  const MenuLink = ({ href, className, children }: { href: string, className?: string, children: React.ReactNode }) => (
    <Link 
      href={href} 
      className={className} 
      onClick={closeMenu}
    >
      {children}
    </Link>
  );

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
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center Section: Navigation Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('nav.properties')}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <ListItem
                        href={localizedHref('/properties')}
                        title="All Properties"
                      >
                        Browse our complete collection of luxury properties
                      </ListItem>
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
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white")}>
                      {t('nav.activities')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/about')} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white")}>
                      {t('nav.about')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/contact')} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white")}>
                      {t('nav.contact')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* Admin Link in Main Navigation - Only show if user is admin */}
                {isAdmin && (
                  <NavigationMenuItem>
                    <Link href={localizedHref('/admin')} legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30")}>
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t('auth.adminDashboard')}
                        </span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Section: User Options */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Only show on mobile */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <nav className="flex flex-col space-y-6 mt-6">
                    {/* Properties Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-lg font-semibold rounded-lg bg-transparent">
                        <Building2 className="h-5 w-5" />
                        {t('nav.properties')}
                      </div>
                      <div className="ml-4 flex flex-col space-y-3">
                        <MenuLink
                          href={localizedHref('/properties')}
                          className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-transparent transition-all duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">All Properties</span>
                            <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Browse our complete collection of luxury properties</span>
                        </MenuLink>
                        <MenuLink
                          href={localizedHref('/properties?type=villa')}
                          className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-transparent transition-all duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">Villas</span>
                            <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Luxury villas with exclusive amenities and private spaces</span>
                        </MenuLink>
                        <MenuLink
                          href={localizedHref('/properties?type=condo')}
                          className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-transparent transition-all duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">Condos</span>
                            <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                          </div>
                          <span className="text-sm text-muted-foreground">Modern condominiums with resort-style facilities</span>
                        </MenuLink>
                      </div>

                    </div>

                    {/* Other Mobile Menu Items */}
                    <MenuLink href={localizedHref('/activities')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                      <Home className="h-5 w-5" />
                      {t('nav.activities')}
                    </MenuLink>
                    <MenuLink href={localizedHref('/about')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                      <Info className="h-5 w-5" />
                      {t('nav.about')}
                    </MenuLink>
                    <MenuLink href={localizedHref('/contact')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                      <Phone className="h-5 w-5" />
                      {t('nav.contact')}
                    </MenuLink>
                    
                    {/* Admin Links - Only show if user is admin */}
                    {isAdmin && (
                      <div className="space-y-2">
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Admin
                          </div>
                        </div>
                        <MenuLink 
                          href={localizedHref('/admin')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          <Shield className="h-5 w-5" />
                          {t('auth.adminDashboard')}
                        </MenuLink>
                        <MenuLink 
                          href={localizedHref('/direct-admin')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                        >
                          <Settings className="h-5 w-5" />
                          Direct Admin Access
                        </MenuLink>
                      </div>
                    )}
                    
                    {/* User Account Links - Only show if logged in */}
                    {user && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('auth.account')}
                          </div>
                        </div>
                        <MenuLink 
                          href={localizedHref('/dashboard')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <User className="h-5 w-5" />
                          {t('auth.dashboard')}
                        </MenuLink>
                        <MenuLink 
                          href={localizedHref('/profile')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <User className="h-5 w-5" />
                          {t('auth.profile')}
                        </MenuLink>
                        <button
                          onClick={() => {
                            closeMenu();
                            const locale = pathname.split('/')[1] || 'en';
                            router.push(`/${locale}/auth/logout`);
                          }}
                          className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-5 w-5" />
                          {t('auth.signOut')}
                        </button>
                      </>
                    )}
                    
                    {/* Auth Links - Only show if not logged in */}
                    {!user && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('auth.account')}
                          </div>
                        </div>
                        <MenuLink 
                          href={localizedHref('/auth/login')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <User className="h-5 w-5" />
                          {t('auth.signIn')}
                        </MenuLink>
                        <MenuLink 
                          href={localizedHref('/auth/register')} 
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                        >
                          <User className="h-5 w-5" />
                          {t('auth.signUp')}
                        </MenuLink>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* User Account Options */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex gap-2 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('auth.account')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userProfile?.full_name || user.email}
                    {isAdmin && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Admin
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={localizedHref('/admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          {t('auth.adminDashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={localizedHref('/direct-admin')}>
                          <Settings className="mr-2 h-4 w-4" />
                          Direct Admin Access
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
                  <DropdownMenuItem onClick={() => {
                    const locale = pathname.split('/')[1] || 'en';
                    router.push(`/${locale}/auth/logout`);
                  }} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white" asChild>
                  <Link href={localizedHref('/auth/login')}>
                    {t('auth.signIn')}
                  </Link>
                </Button>
                <Button variant="ghost" className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent dark:active:bg-transparent transition-colors duration-300 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white" asChild>
                  <Link href={localizedHref('/auth/register')}>
                    {t('auth.signUp')}
                  </Link>
                </Button>
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
