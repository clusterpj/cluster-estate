import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Home, MapPin, Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full sticky top-0 z-50">
      <div className="w-full border-b bg-white/75 dark:bg-stone-950/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center min-h-16 w-full px-4 md:px-6">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-xl md:text-2xl font-semibold text-stone-800 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors flex items-center gap-2"
              >
                <Home className="h-5 w-5 md:h-6 md:w-6" />
                <span>RealtyWest</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/properties" 
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-medium"
              >
                Properties
              </Link>
              <Link 
                href="/about" 
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-sm font-medium"
              >
                Contact
              </Link>
              <ModeToggle />
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <ModeToggle />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link 
                      href="/properties" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-lg font-medium"
                    >
                      Properties
                    </Link>
                    <Link 
                      href="/about" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-lg font-medium"
                    >
                      About
                    </Link>
                    <Link 
                      href="/contact" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-lg font-medium"
                    >
                      Contact
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-stone-900/95 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input 
                placeholder="Search for properties" 
                className="w-full pl-10 bg-stone-800/50 border-stone-700 hover:border-stone-600 transition-colors focus-visible:ring-stone-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger className="w-full bg-stone-800/50 border-stone-700 hover:border-stone-600 transition-colors">
                  <SelectValue placeholder="I want to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy" className="hover:bg-stone-50 dark:hover:bg-stone-800">Buy</SelectItem>
                  <SelectItem value="rent" className="hover:bg-stone-50 dark:hover:bg-stone-800">Rent</SelectItem>
                  <SelectItem value="sold" className="hover:bg-stone-50 dark:hover:bg-stone-800">Sold</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full bg-stone-800/50 border-stone-700 hover:border-stone-600 transition-colors">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 bedroom" className="hover:bg-stone-50 dark:hover:bg-stone-800">1 Bedroom</SelectItem>
                  <SelectItem value="2 bedroom" className="hover:bg-stone-50 dark:hover:bg-stone-800">2 Bedrooms</SelectItem>
                  <SelectItem value="3 bedroom" className="hover:bg-stone-50 dark:hover:bg-stone-800">3 Bedrooms</SelectItem>
                  <SelectItem value="4+ bedroom" className="hover:bg-stone-50 dark:hover:bg-stone-800">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full bg-stone-800/50 border-stone-700 hover:border-stone-600 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <SelectValue placeholder="Property Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house" className="hover:bg-stone-50 dark:hover:bg-stone-800">House</SelectItem>
                  <SelectItem value="condo" className="hover:bg-stone-50 dark:hover:bg-stone-800">Condo</SelectItem>
                  <SelectItem value="apartment" className="hover:bg-stone-50 dark:hover:bg-stone-800">Apartment</SelectItem>
                  <SelectItem value="townhouse" className="hover:bg-stone-50 dark:hover:bg-stone-800">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
