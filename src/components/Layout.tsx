import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-haru-cream-light">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-haru-cream shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-haru-brown font-bold text-xl tracking-tight hover:text-haru-burnt transition-colors"
          >
            <svg
              className="w-7 h-7 text-haru-orange"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            URL LIST
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link
                to="/my-links"
                className="text-sm font-medium text-haru-brown/70 hover:text-haru-burnt transition-colors"
              >
                My Links
              </Link>
            )}

            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-sm font-medium text-haru-brown/70 hover:text-haru-red transition-colors cursor-pointer"
              >
                <img
                  src={user.photoURL || ''}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-haru-cream"
                />
                Sign Out
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 bg-haru-brown text-white text-sm font-medium rounded-lg hover:bg-haru-burnt transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-haru-cream bg-white/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-haru-brown/50">
          © {new Date().getFullYear()} URL LIST — Share your links beautifully.
        </div>
      </footer>
    </div>
  );
}
