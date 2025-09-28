import { Home, Users, Award, CheckCircle, Shield, Heart, Target, Zap } from "lucide-react"

export default function AboutPage() {
  const companyStats = [
    { number: "1000+", label: "Tokenized Properties", icon: Award },
    { number: "$500M+", label: "Total Value Locked", icon: Home },
    { number: "15K+", label: "Token Holders", icon: Users },
    { number: "99.9%", label: "Smart Contract Uptime", icon: CheckCircle }
  ]

  const coreValues = [
    {
      icon: Shield,
      title: "Security First",
      description: "Battle-tested smart contracts with comprehensive security measures, audit trails, and emergency protocols."
    },
    {
      icon: Target,
      title: "Regulatory Compliance",
      description: "Built-in compliance engine ensuring all tokenized assets meet security token regulations across jurisdictions."
    },
    {
      icon: Zap,
      title: "Blockchain Innovation",
      description: "Leveraging ERC-3643 standard and Integra Chain ecosystem for seamless, transparent real estate transactions."
    },
    {
      icon: Heart,
      title: "Democratized Access",
      description: "Breaking down barriers to real estate investment through fractional ownership and automated processes."
    }
  ]

  const achievements = [
    {
      year: "2023",
      title: "Integra Chain Integration",
      description: "Successfully launched on Integra Chain with RWA Asset Passport integration for property metadata"
    },
    {
      year: "2024", 
      title: "ERC-3643 Implementation",
      description: "Complete custom implementation of ERC-3643 standard for compliant security token trading"
    },
    {
      year: "2024",
      title: "Smart Contract Audit",
      description: "Comprehensive security audit with zero critical vulnerabilities and 100% test coverage"
    },
    {
      year: "2025",
      title: "Regulatory Approval",
      description: "First blockchain platform to achieve multi-jurisdictional compliance for tokenized real estate"
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
                KrayState 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {" "}ArEstate
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Revolutionary blockchain-based platform transforming real estate through property tokenization, smart contract automation, and regulatory compliance on the Integra Chain ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
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

      {/* Mission Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-100 mb-8">
                Our Mission & Technology
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">Mission</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    To revolutionize real estate investment through blockchain technology, enabling fractional property ownership, automated compliance, and transparent transactions while reducing barriers to entry and eliminating intermediaries.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-purple-400 mb-3">Technology Stack</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Built on Solidity 0.8.20 with OpenZeppelin security patterns, implementing ERC-3643 compliance standard, and integrated with Integra Chain&apos;s RWA Asset Passport for comprehensive property tokenization infrastructure.
                  </p>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Core Features</h3>
                <div className="space-y-4">
                  {[
                    "🏠 ERC-3643 compliant security tokens for fractional ownership",
                    "👥 Integrated KYC/AML with role-based access control", 
                    "📋 Automated lease management with smart contracts",
                    "💰 Secure escrow and automated payment processing",
                    "🔒 Built-in regulatory compliance across jurisdictions",
                    "⚡ Gas-optimized contracts with comprehensive testing"
                  ].map((reason, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The fundamental principles that guide every decision we make and every service we provide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className={`group text-center animate-fade-in-up animation-delay-${(index + 1) * 200}`}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full mb-6 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all duration-300 group-hover:scale-110 transform">
                  <value.icon className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Timeline */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Development Journey & Milestones
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From concept to production-ready blockchain platform with enterprise-grade security and compliance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {achievements.map((achievement, index) => (
                // eslint-disable-next-line react/jsx-key
                <div>
                  <div className="flex-shrink-0">
                  
                  </div>
                  <div className="flex-1 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300 group-hover:shadow-xl">
                    <h3 className="text-2xl font-semibold text-gray-100 mb-3">{achievement.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Why Choose KrayState ArEstate?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced blockchain technology solving traditional real estate pain points
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: "Property Tokenization",
                description: "Transform real estate into ERC-3643 compliant security tokens enabling fractional ownership and seamless trading with regulatory compliance."
              },
              {
                icon: Users,
                title: "Identity & Compliance",
                description: "Integrated KYC/AML system with role-based access control ensuring all participants meet regulatory requirements before transactions."
              },
              {
                icon: Award,
                title: "Smart Lease Management",
                description: "Automated lease agreement creation, status tracking, and dispute resolution with immutable record-keeping for transparency."
              },
              {
                icon: Shield,
                title: "Secure Escrow & Payments",
                description: "Automated security deposit handling and rent collection with support for both cryptocurrency and fiat payment rails."
              },
              {
                icon: Zap,
                title: "Gas Optimization",
                description: "Optimized smart contracts with struct packing, batch operations, and 200-run optimization for cost-effective transactions."
              },
              {
                icon: CheckCircle,
                title: "Audit & Security",
                description: "Comprehensive security measures with ReentrancyGuard, SafeERC20 integration, and extensive testing with 100% coverage."
              }
            ].map((advantage, index) => (
              <div
                key={advantage.title}
                className={`group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up animation-delay-${(index + 1) * 100}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-6 group-hover:bg-blue-600/30 transition-colors group-hover:scale-110 transform duration-300">
                  <advantage.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-100">{advantage.title}</h3>
                <p className="text-gray-300 leading-relaxed">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-6">
              Ready to Start Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Real Estate Journey?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join over 25,000 satisfied clients who have successfully bought, sold, or invested in properties with ArEstate. 
              Your dream property is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a
                href="/properties"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Explore Properties
              </a>
              <a
                href="/contact"
                className="group bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/50 text-gray-100 px-10 py-4 rounded-lg font-semibold transition-all duration-300 border border-gray-600 hover:border-gray-500 flex items-center justify-center gap-3"
              >
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Talk to an Expert
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
