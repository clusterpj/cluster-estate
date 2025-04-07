"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export function Footer() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail("")
  }

  return (
    <footer className="w-full bg-stone-950 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info - Updated with the same logo as header */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="flex items-center gap-2"
            >
              <Image
                src="/cabarete-villas.png"
                alt="Cabarete Villas Logo"
                width={200}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-stone-400 max-w-sm">
              Your trusted partner in finding the perfect property. We make real estate simple and accessible.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-white hover:bg-stone-800">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-white hover:bg-stone-800">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-white hover:bg-stone-800">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-white hover:bg-stone-800">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <nav>
              <ul className="space-y-2">
                {[
                  ['All Properties', `http://localhost:3000/en/properties`],
                  ['Villas', `http://localhost:3000/en/properties?type=villa`],
                  ['Condos', `http://localhost:3000/en/properties?type=condo`],
                  ['Activities', 'http://localhost:3000/en/activities'],
                  ['About Us', 'http://localhost:3000/en/about'],
                  ['Contact', 'http://localhost:3000/en/contact']
                ].map(([title, url]) => (
                  <li key={url}>
                    <Link 
                      href={url} 
                      className="text-sm hover:text-white transition-colors inline-block py-1"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-stone-400 mt-1 shrink-0" />
                <span>Cabarete</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-stone-400 shrink-0" />
                <span>+1 (809) 571-0370</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                <span>reservecabaretevillas@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Newsletter</h3>
            <p className="text-sm text-stone-400">
              Subscribe to our newsletter for the latest property updates.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-stone-900 border-stone-800 focus-visible:ring-stone-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8 bg-stone-800" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-stone-400">
          <p className="text-center sm:text-left"> 2025 Cabarete Villas. All rights reserved.</p>
          <nav className="flex items-center gap-4 flex-wrap justify-center">
            {[
              ['Terms of Service', '/terms'],
              ['Privacy Policy', '/privacy'],
              ['Cookie Policy', '/cookies']
            ].map(([title, url]) => (
              <Link 
                key={url}
                href={url} 
                className="hover:text-white transition-colors"
              >
                {title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
