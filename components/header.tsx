"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Menu, Search, SlidersHorizontal, Home, Building2, Users, Info, Phone, User, LogOut } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
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

const SearchFilters = () => (
  <div className="grid gap-3">
    <div className="grid gap-1.5">
      <Label htmlFor="price">Price Range</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select price range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0-250k">$0 - $250,000</SelectItem>
          <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
          <SelectItem value="500k-750k">$500,000 - $750,000</SelectItem>
          <SelectItem value="750k-1m">$750,000 - $1M</SelectItem>
          <SelectItem value="1m+">$1M+</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="property-type">Property Type</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="house">House</SelectItem>
          <SelectItem value="apartment">Apartment</SelectItem>
          <SelectItem value="condo">Condo</SelectItem>
          <SelectItem value="townhouse">Townhouse</SelectItem>
          <SelectItem value="land">Land</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="beds">Bedrooms</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select bedrooms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1+</SelectItem>
          <SelectItem value="2">2+</SelectItem>
          <SelectItem value="3">3+</SelectItem>
          <SelectItem value="4">4+</SelectItem>
          <SelectItem value="5">5+</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <Separator />
    <Button>Apply Filters</Button>
  </div>
);

export function Header() {
  const { user, signOut, userProfile } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1];

  const localizedHref = (path: string) => `/${currentLocale}${path}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-0 text-base hover:bg-transparent hover:text-accent-foreground md:hidden">
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
                        href={localizedHref('/properties/buy')}
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{t('nav.buyProperties')}</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{t('nav.buyPropertiesDesc')}</span>
                      </Link>
                      <Link 
                        href={localizedHref('/properties/rent')}
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{t('nav.rentProperties')}</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{t('nav.rentPropertiesDesc')}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Other Mobile Menu Items */}
                  <Link href={localizedHref('/agents')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent">
                    <Users className="h-5 w-5" />
                    {t('nav.agents')}
                  </Link>
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

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('nav.properties')}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href={localizedHref('/properties/featured')}
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          >
                            <Building2 className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              {t('nav.featuredProperties')}
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {t('nav.featuredPropertiesDesc')}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem
                        href={localizedHref('/properties/buy')}
                        title={t('nav.buyProperties')}
                      >
                        {t('nav.buyPropertiesDesc')}
                      </ListItem>
                      <ListItem
                        href={localizedHref('/properties/rent')}
                        title={t('nav.rentProperties')}
                      >
                        {t('nav.rentPropertiesDesc')}
                      </ListItem>
                      <ListItem
                        href={localizedHref('/properties/new')}
                        title={t('nav.newDevelopments')}
                      >
                        {t('nav.newDevelopmentsDesc')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href={localizedHref('/agents')} legacyBehavior passHref>
                    <NavigationMenuTrigger>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('nav.agents')}
                      </span>
                    </NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px]">
                      <ListItem
                        href={localizedHref('/agents/find')}
                        title={t('nav.findAgent')}
                      >
                        {t('nav.findAgentDesc')}
                      </ListItem>
                      <ListItem
                        href={localizedHref('/agents/join')}
                        title={t('nav.joinTeam')}
                      >
                        {t('nav.joinTeamDesc')}
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

          {/* Right Section: Search, Auth, Theme, Language */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('search.placeholder')}
                  className="w-[200px] pl-8 pr-4 md:w-[300px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4" align="end">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">{t('search.filters')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('search.filtersDesc')}
                        </p>
                      </div>
                      <SearchFilters />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Mobile Search Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">{t('search.open')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85%]">
                <SheetHeader>
                  <SheetTitle>{t('search.title')}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t('search.placeholder')}
                      className="w-full pl-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t('search.filters')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('search.filtersDesc')}
                    </p>
                  </div>
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>

            {/* Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
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
                <Button variant="ghost" asChild>
                  <Link href={localizedHref('/auth/login')}>
                    {t('auth.signIn')}
                  </Link>
                </Button>
                <Button asChild>
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
