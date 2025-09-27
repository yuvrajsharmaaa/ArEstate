"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Heart, Bed, Bath, Square } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Property {
  id: string
  name: string
  address: string
  price: string
  type: string
  offer: string
  bedroom: string
  bathroom: string
  carpet: string
  image01: string
  createdAt: string
  user: {
    name: string
  }
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    offer: "",
    maxPrice: ""
  })
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (filters.location) queryParams.append("location", filters.location)
        if (filters.type) queryParams.append("type", filters.type)
        if (filters.offer) queryParams.append("offer", filters.offer)
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice)

        const response = await fetch(`/api/properties?${queryParams}`)
        const data = await response.json()
        
        if (response.ok) {
          setProperties(data.properties)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProperties()
  }, [filters.location, filters.type, filters.offer, filters.maxPrice])

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.location) queryParams.append("location", filters.location)
      if (filters.type) queryParams.append("type", filters.type)
      if (filters.offer) queryParams.append("offer", filters.offer)
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice)

      const response = await fetch(`/api/properties?${queryParams}`)
      const data = await response.json()
      
      if (response.ok) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchProperties()
  }

  const formatPrice = (price: string) => {
    const num = parseInt(price)
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
    return `₹${num}`
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Search Bar */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="">All Types</option>
                <option value="flat">Apartment</option>
                <option value="house">House</option>
                <option value="shop">Commercial</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.offer}
                onChange={(e) => setFilters({...filters, offer: e.target.value})}
              >
                <option value="">All Offers</option>
                <option value="sale">For Sale</option>
                <option value="resale">Resale</option>
                <option value="rent">For Rent</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              >
                <option value="">Any Budget</option>
                <option value="500000">Up to ₹5L</option>
                <option value="1000000">Up to ₹10L</option>
                <option value="2000000">Up to ₹20L</option>
                <option value="5000000">Up to ₹50L</option>
                <option value="10000000">Up to ₹1Cr</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Properties {properties.length > 0 && `(${properties.length})`}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={property.image01 || "/placeholder-property.jpg"}
                    alt={property.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-property.jpg"
                    }}
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {property.offer}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {property.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </p>

                  <div className="text-2xl font-bold text-blue-600 mb-3">
                    {formatPrice(property.price)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedroom} bed
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathroom} bath
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.carpet} sqft
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      by {property.user.name}
                    </div>
                    <Link
                      href={`/properties/${property.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
