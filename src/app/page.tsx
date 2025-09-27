export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">
            Welcome to Real Estate Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Find your dream home or list your property with ease
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/properties"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </a>
            <a
              href="/contact"
              className="bg-gray-700 text-gray-100 px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Buy Properties</h3>
            <p className="text-gray-300">
              Discover a wide range of properties for sale in your preferred location.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Sell Properties</h3>
            <p className="text-gray-300">
              List your property and reach thousands of potential buyers.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-100">Expert Guidance</h3>
            <p className="text-gray-300">
              Get professional advice from our experienced real estate experts.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
