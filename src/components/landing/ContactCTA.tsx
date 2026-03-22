import Link from "next/link";

export function ContactCTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to stop losing clients?
        </h2>
        <p className="text-gray-500 mb-8">
          Build your own AI agent in 5 minutes — or let us set it up for you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/builder"
            className="px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Build Your Agent →
          </Link>
          <a
            href="https://t.me/bo_mirash"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Contact on Telegram
          </a>
        </div>

        <p className="mt-12 text-xs text-gray-400">
          © {new Date().getFullYear()} AI Agent Constructor. Built with ❤️
        </p>
      </div>
    </section>
  );
}
