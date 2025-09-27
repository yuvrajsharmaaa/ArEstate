"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Home, PlusCircle } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-gray-100">RealEstate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/properties" className="text-gray-300 hover:text-blue-400 transition-colors">
              Properties
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
              Contact
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/post-property" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1">
                <PlusCircle className="h-4 w-4" />
                <span>Post Property</span>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-blue-400 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-700">
              <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link href="/properties" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">
                Properties
              </Link>
              <Link href="/about" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-300 hover:text-blue-400 transition-colors">
                Contact
              </Link>
              
              <Link href="/post-property" className="block px-3 py-2 text-blue-400 font-medium">
                Post Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
