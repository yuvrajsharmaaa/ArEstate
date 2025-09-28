import { Home, Users, Award, CheckCircle, Shield, Heart, Target, Zap } from "lucide-react"

export default function AboutPage() {
  const companyStats = [
    { number: "15+", label: "Years of Excellence", icon: Award },
    { number: "50K+", label: "Properties Sold", icon: Home },
    { number: "25K+", label: "Happy Families", icon: Users },
    { number: "100+", label: "Expert Agents", icon: CheckCircle }
  ]

  const coreValues = [
    {
      icon: Heart,
      title: "Customer-Centric",
      description: "Every decision we make is guided by what's best for our clients. Your success is our success."
    },
    {
      icon: Shield,
      title: "Trust & Integrity",
      description: "We build lasting relationships through honest communication and ethical business practices."
    },
    {
      icon: Target,
      title: "Results-Driven",
      description: "We're committed to achieving exceptional outcomes that exceed your expectations."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We leverage cutting-edge technology to streamline the real estate experience."
    }
  ]

  const achievements = [
    {
      year: "2020",
      title: "Best Real Estate Platform",
      description: "Awarded by National Property Awards"
    },
    {
      year: "2021", 
      title: "Top Customer Satisfaction",
      description: "98% satisfaction rating from independent survey"
    },
    {
      year: "2023",
      title: "Technology Innovation Award",
      description: "Recognized for AI-powered property matching"
    },
    {
      year: "2024",
      title: "Fastest Growing Platform",
      description: "300% growth in user base year over year"
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
                About 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {" "}ArEstate
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                For over 15 years, we&apos;ve been transforming the real estate experience, helping families find their perfect homes and investors discover lucrative opportunities
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
                Our Mission & Vision
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-blue-400 mb-3">Mission</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    To democratize real estate by providing everyone access to exceptional properties, expert guidance, and transparent transactions through innovative technology and personalized service.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-purple-400 mb-3">Vision</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    To become the world&apos;s most trusted real estate platform, where every property transaction is seamless, transparent, and successful for all parties involved.
                  </p>
                </div>
              </div>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Why Clients Choose Us</h3>
                <div className="space-y-4">
                  {[
                    "Expert market knowledge and insights",
                    "Personalized service tailored to your needs", 
                    "Cutting-edge technology for better results",
                    "Transparent communication throughout",
                    "Extensive network of trusted professionals",
                    "Proven track record of successful transactions"
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
              Our Journey & Achievements
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Milestones that showcase our commitment to excellence and innovation in real estate
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.year}
                  className={`group flex items-start space-x-8 animate-fade-in-up animation-delay-${(index + 1) * 200}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {achievement.year}
                    </div>
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
              Why Choose ArEstate?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              What sets us apart in the competitive real estate marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: "Verified Properties",
                description: "Every property undergoes rigorous verification to ensure authenticity, accurate pricing, and complete documentation."
              },
              {
                icon: Users,
                title: "Expert Team",
                description: "Our certified real estate professionals have decades of combined experience and deep market knowledge."
              },
              {
                icon: Award,
                title: "Proven Results",
                description: "Consistently rated #1 in customer satisfaction with 98% of clients recommending our services."
              },
              {
                icon: Shield,
                title: "Secure Transactions",
                description: "Bank-level security protocols and escrow services ensure your transactions are completely protected."
              },
              {
                icon: Zap,
                title: "Fast Processing",
                description: "Streamlined processes and digital tools reduce transaction time by up to 40% compared to traditional methods."
              },
              {
                icon: CheckCircle,
                title: "Full Support",
                description: "From initial consultation to closing and beyond, we provide comprehensive support throughout your journey."
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
