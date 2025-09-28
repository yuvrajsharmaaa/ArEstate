"use client"

import { Search, Home as HomeIcon, Building, Users, Star, MapPin, TrendingUp, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const [searchType, setSearchType] = useState("buy")

  const stats = [
    { number: "1000+", label: "Tokenized Properties", icon: Building },
    { number: "15K+", label: "Token Holders", icon: Users },
    { number: "99.9%", label: "Smart Contract Uptime", icon: Star },
    { number: "24/7", label: "Automated Processing", icon: MapPin }
  ]

  const features = [
    {
      icon: TrendingUp,
      title: "Property Tokenization",
      description: "Transform real estate into ERC-3643 compliant security tokens enabling fractional ownership and seamless trading"
    },
    {
      icon: Shield,
      title: "Regulatory Compliance",
      description: "Built-in compliance engine with KYC/AML integration ensuring all transactions meet regulatory requirements"
    },
    {
      icon: Clock,
      title: "Smart Automation",
      description: "Automated lease management, payment processing, and escrow handling through smart contracts"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-100 mb-6 tracking-tight">
                Revolutionize Real Estate with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {" "}Blockchain
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                KrayState ArEstate transforms property investment through tokenization, enabling fractional ownership, automated compliance, and seamless trading on the Integra Chain ecosystem
              </p>
            </div>

            {/* Search Bar */}
            <div className="animate-fade-in-up animation-delay-200 max-w-4xl mx-auto mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-1">
                    {["buy", "rent", "sell"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                          searchType === type
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter property ID, token symbol, or location..."
                      className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Link href={`/properties`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <Search className="w-5 h-5" />
                    Search
                  </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up animation-delay-400 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/properties"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Building className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Browse Properties
              </a>
              <a
                href="/contact"
                className="group bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/50 text-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 border border-gray-600 hover:border-gray-500 flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Talk to Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center animate-fade-in-up animation-delay-${(index + 1) * 100} group`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4 group-hover:bg-blue-600/30 transition-colors">
                  <stat.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-100 mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Revolutionary Blockchain Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Leveraging cutting-edge blockchain technology to transform real estate investment and management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
                        <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-6 group-hover:bg-blue-600/30 transition-colors group-hover:scale-110 transform duration-300">
                <HomeIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Tokenized Properties</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Invest in fractional property ownership through ERC-3643 compliant security tokens. Access premium real estate with lower barriers to entry.
              </p>
              <a href="/properties" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore Tokens
                <TrendingUp className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animation-delay-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-6 group-hover:bg-purple-600/30 transition-colors group-hover:scale-110 transform duration-300">
                <Building className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Smart Contracts</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Automated lease management, escrow services, and payment processing with transparent blockchain execution and compliance.
              </p>
              <a href="/about" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <TrendingUp className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animation-delay-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-6 group-hover:bg-green-600/30 transition-colors group-hover:scale-110 transform duration-300">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">KYC/AML Compliance</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Integrated identity verification and regulatory compliance system ensuring all participants meet legal requirements for security token transactions.
              </p>
              <a href="/contact" className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Get Verified
                <TrendingUp className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Blockchain Technology Stack
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built on Integra Chain with enterprise-grade security and compliance features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group text-center animate-fade-in-up animation-delay-${(index + 1) * 200}`}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full mb-6 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all duration-300 group-hover:scale-110 transform">
                  <feature.icon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
