export default function Contact() {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-4">
        Have questions or suggestions? Reach out to us.
      </p>

      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Your Message"
          className="border p-2 rounded"
        />
        <button type="button" className="bg-blue-600 text-white p-2 rounded">
          Send Message
        </button>
        <p className="text-sm text-gray-500">
          Contact functionality coming soon.
        </p>
      </form>
    </div>
  );
}