export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-slate-500 text-lg mb-8">Page not found</p>
        <a
          href="/"
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
