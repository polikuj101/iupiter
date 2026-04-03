export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Transparent navbar */}
      <nav className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Saleon</span>
        </div>
        <a
          href="/auth/login"
          className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition"
        >
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-3">Your AI Real Estate Agent</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-sm">
          Respond to Instagram DMs instantly using your listings and tone of voice.
        </p>
        <a
          href="/auth/login"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
