"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, SlidersHorizontal, Home, Building2, Users, Info, Phone } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

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
                      Properties
                    </div>
                    <div className="ml-4 flex flex-col space-y-3">
                      <Link 
                        href="/properties/buy" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Buy Properties</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Find your dream home from our collection.</span>
                      </Link>
                      <Link 
                        href="/properties/rent" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Rent Properties</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Discover rental properties that match your needs.</span>
                      </Link>
                      <Link 
                        href="/properties/new" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">New Developments</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Explore newly built properties.</span>
                      </Link>
                      <Link 
                        href="/properties/luxury" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Luxury Properties</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Experience luxury living.</span>
                      </Link>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Agents Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-lg font-semibold rounded-lg bg-accent/50">
                      <Users className="h-5 w-5" />
                      Agents
                    </div>
                    <div className="ml-4 flex flex-col space-y-3">
                      <Link 
                        href="/agents/find" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Find an Agent</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Connect with experienced professionals.</span>
                      </Link>
                      <Link 
                        href="/agents/join" 
                        className="group relative flex flex-col space-y-1.5 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">Join Our Team</span>
                          <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Become part of our network.</span>
                      </Link>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Quick Links */}
                  <div className="space-y-3">
                    <Link 
                      href="/about" 
                      className="group flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">About</span>
                      </div>
                      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </Link>

                    <Link 
                      href="/contact" 
                      className="group flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Contact</span>
                      </div>
                      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">RealtyWest</span>
            </Link>
          </div>

          {/* Center Section: Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/properties" legacyBehavior passHref>
                  <NavigationMenuTrigger>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Properties
                    </span>
                  </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/properties/buy" title="Buy Properties">
                      Find your dream home from our extensive collection of properties for sale.
                    </ListItem>
                    <ListItem href="/properties/rent" title="Rent Properties">
                      Discover rental properties that match your lifestyle and budget.
                    </ListItem>
                    <ListItem href="/properties/new" title="New Developments">
                      Explore newly built properties and upcoming developments.
                    </ListItem>
                    <ListItem href="/properties/luxury" title="Luxury Properties">
                      Experience luxury living with our premium property collection.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/agents" legacyBehavior passHref>
                  <NavigationMenuTrigger>
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Agents
                    </span>
                  </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/agents/find" title="Find an Agent">
                      Connect with experienced real estate professionals.
                    </ListItem>
                    <ListItem href="/agents/join" title="Join Our Team">
                      Become part of our growing network of real estate agents.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      About
                    </span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact
                    </span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Section: Search and Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties..."
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
                        <h4 className="font-medium leading-none">Filters</h4>
                        <p className="text-sm text-muted-foreground">
                          Refine your property search
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
                  <span className="sr-only">Open Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85%]">
                <SheetHeader>
                  <SheetTitle>Search Properties</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search properties..."
                      className="w-full pl-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Refine your property search
                    </p>
                  </div>
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
