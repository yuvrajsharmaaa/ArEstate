"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our experts",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri 9AM-6PM",
      color: "blue"
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a detailed message",
      contact: "info@realestate.com",
      availability: "24/7 - We respond within 24hrs",
      color: "purple"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help online",
      contact: "Start Chat",
      availability: "Available 9AM-9PM",
      color: "green"
    }
  ]

  const officeLocations = [
    {
      city: "New York",
      address: "123 Real Estate Ave, Suite 100",
      phone: "+1 (555) 123-4567",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      city: "Los Angeles", 
      address: "456 Property Blvd, Floor 5",
      phone: "+1 (555) 987-6543",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      city: "Chicago",
      address: "789 Realty Street, Building C",
      phone: "+1 (555) 456-7890", 
      hours: "Mon-Fri 9AM-6PM"
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Message sent successfully! We'll get back to you soon.")
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: ""
        })
      } else {
        setError(data.error || "Failed to send message")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-100 mb-6 tracking-tight">
                Let&apos;s 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {" "}Connect
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Ready to find your dream property? Our expert team is here to guide you through every step of your real estate journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-300">Choose your preferred way to reach us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={method.title}
                className={`group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up animation-delay-${(index + 1) * 200}`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${method.color}-600/20 rounded-full mb-6 group-hover:bg-${method.color}-600/30 transition-colors group-hover:scale-110 transform duration-300`}>
                  <method.icon className={`w-8 h-8 text-${method.color}-400`} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">{method.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{method.description}</p>
                <div className="space-y-2">
                  <p className={`font-semibold text-${method.color}-400`}>{method.contact}</p>
                  <p className="text-sm text-gray-500">{method.availability}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Office Locations */}
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-100 mb-8">Our Office Locations</h2>
            <div className="space-y-8">
              {officeLocations.map((office, index) => (
                <div
                  key={office.city}
                  className={`group bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <MapPin className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-100 mb-2">{office.city}</h3>
                      <p className="text-gray-300 mb-2">{office.address}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{office.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{office.hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up animation-delay-200">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50">
              <h2 className="text-4xl font-bold text-gray-100 mb-8">
                Send us a Message
              </h2>

              {error && (
                <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-900/50 border border-green-500/50 text-green-200 px-6 py-4 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-lg font-medium text-gray-300 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-6 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-gray-100 placeholder-gray-400 transition-all duration-300"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-lg font-medium text-gray-300 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-6 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-gray-100 placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-lg font-medium text-gray-300 mb-3">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full px-6 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-gray-100 placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-lg font-medium text-gray-300 mb-3">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="w-full px-6 py-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-gray-100 placeholder-gray-400 transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you find your perfect property..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                  <span>{isLoading ? "Sending Message..." : "Send Message"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Quick answers to common questions about our services
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How long does it take to buy a property?",
                answer: "The typical home buying process takes 30-45 days from offer acceptance to closing, though it can vary based on financing and inspection results."
              },
              {
                question: "What documents do I need to sell my property?",
                answer: "You'll need the deed, tax records, recent mortgage statements, property disclosures, and any HOA documents. We'll guide you through the complete list."
              },
              {
                question: "Do you charge any upfront fees?", 
                answer: "No, we don't charge any upfront fees to buyers. Our commission is paid at closing by the seller, as is standard in real estate transactions."
              },
              {
                question: "How do you determine property values?",
                answer: "We use comparative market analysis (CMA) looking at recently sold similar properties, current market conditions, and unique property features."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
              >
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
