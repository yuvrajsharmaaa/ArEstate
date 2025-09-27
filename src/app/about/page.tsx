import { Home, Users, Award, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className=" py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
              About RealEstate
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are dedicated to helping people find their perfect homes and making 
              real estate transactions simple, transparent, and efficient.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                We believe everyone deserves to find their perfect home. Our platform 
                connects buyers, sellers, and renters with verified properties and 
                trusted real estate professionals.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Through innovative technology and personalized service, we make real 
                estate transactions smoother and more transparent for everyone involved.
              </p>
            </div>
            <div className="p-8 rounded-lg shadow-lg border border-gray-700 bg-gray-800/20">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-gray-300">Properties Listed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">5K+</div>
                  <div className="text-gray-300">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-300">Cities Covered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
                  <div className="text-gray-300">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                Transparency
              </h3>
              <p className="text-gray-300">
                We believe in complete transparency in all our dealings. 
                No hidden fees, no surprises - just honest, clear communication.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                Customer First
              </h3>
              <p className="text-gray-300">
                Our customers are at the heart of everything we do. 
                We go above and beyond to ensure their satisfaction and success.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                Excellence
              </h3>
              <p className="text-gray-300">
                We strive for excellence in every interaction, 
                continuously improving our services and platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-300">
              What makes us different from other real estate platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className=" p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    Verified Properties
                  </h3>
                  <p className="text-gray-300">
                    Every property on our platform is verified by our team to ensure 
                    authenticity and accurate information.
                  </p>
                </div>
              </div>
            </div>

            <div className=" p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    Expert Support
                  </h3>
                  <p className="text-gray-300">
                    Our experienced team is always ready to help you through 
                    every step of your real estate journey.
                  </p>
                </div>
              </div>
            </div>

            <div className=" p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    Easy Process
                  </h3>
                  <p className="text-gray-300">
                    Our streamlined process makes buying, selling, or renting 
                    properties simple and hassle-free.
                  </p>
                </div>
              </div>
            </div>

            <div className=" p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">
                    Trusted Platform
                  </h3>
                  <p className="text-gray-300">
                    Thousands of satisfied customers trust us with their 
                    real estate needs every day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who found their dream properties with us
          </p>
          <div className="space-x-4">
            <a
              href="/properties"
              className=" text-blue-500 px-8 py-3 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-500/50 hover:text-gray-100 transition-colors inline-block"
            >
              Browse Properties
            </a>
            <a
              href="/contact"
                            className=" text-blue-500 px-8 py-3 border-2 border-gray-600 rounded-lg font-semibold hover:bg-gray-500/50 hover:text-gray-100 transition-colors inline-block"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
