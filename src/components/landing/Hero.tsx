import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-28 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-3xl font-black tracking-tight text-gray-900">
            Saleon
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          AI-powered • 24/7 • 2 second response
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Your AI agent that
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
            never sleeps
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          Build an AI receptionist for your business in minutes. It answers
          clients 24/7, books appointments, and never misses a lead — while you
          sleep.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/builder"
            className="px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Build Your Agent →
          </Link>
          <a
            href="#demos"
            className="px-8 py-3.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Try Live Demo
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          No credit card • Free to try • Setup in 5 minutes
        </p>
      </div>
    </section>
  );
}
