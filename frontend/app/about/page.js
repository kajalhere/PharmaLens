export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-6 py-16">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          About PharmaLens
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Making medicine pricing transparent, accessible, and affordable for everyone.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3">💡 What is PharmaLens?</h2>
          <p className="text-gray-600 leading-relaxed">
            PharmaLens is a smart platform that helps users compare branded medicines
            with affordable generic alternatives. It simplifies complex pricing data
            into clear, actionable insights.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3">🎯 Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to reduce healthcare costs by empowering users with reliable
            information. Everyone deserves access to affordable treatment without
            confusion or hidden pricing.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3">⚙️ What We Offer</h2>
          <ul className="text-gray-600 space-y-2">
            <li>• Compare branded vs generic medicines</li>
            <li>• View price differences instantly</li>
            <li>• Clean and simple search experience</li>
            <li>• Data-backed recommendations</li>
          </ul>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3">🚀 Why Choose Us?</h2>
          <p className="text-gray-600 leading-relaxed">
            PharmaLens removes guesswork from medicine buying. By bringing transparency
            to pricing, we help users make smarter and more cost-effective decisions.
          </p>
        </div>

      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto mt-20 grid grid-cols-3 text-center">
        <div>
          <h3 className="text-2xl font-bold text-blue-600">80%</h3>
          <p className="text-gray-500 text-sm">Cost Savings</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-blue-600">1000+</h3>
          <p className="text-gray-500 text-sm">Medicines</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-blue-600">24/7</h3>
          <p className="text-gray-500 text-sm">Accessibility</p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition">
          Start Searching Medicines
        </button>
      </div>

    </div>
  );
}