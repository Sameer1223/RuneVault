import { useEffect, useState, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShowPrompt(true);
    }
  }, [isLoading, isAuthenticated]);

  const handleLogin = () => {
    void loginWithRedirect({
      appState: {
        returnTo: `${location.pathname}${location.search}${location.hash}`,
      },
    });
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (showPrompt && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/5 backdrop-blur-md">
        <div className="relative w-full max-w-md">
          {/* Subtle gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-slate-900/20 rounded-2xl blur-xl -z-10" />
          
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl">
            <div>
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-blue-500/30">
                  <svg className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-semibold text-white">Access Your Decks</h2>
                <p className="text-sm text-slate-400">Sign in to view, create, and manage your deck collection</p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <span>Login</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center px-6 py-2.5 font-medium text-slate-300 transition-all duration-200 rounded-lg border border-slate-600/50 hover:border-slate-500/80 hover:bg-slate-800/50 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Browse as Guest
                </button>
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              </div>

              {/* Footer benefits */}
              <ul className="space-y-2 text-xs text-slate-400 flex flex-col items-center">
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    ✓
                  </span>
                  <span>Save and organize your decks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    ✓
                  </span>
                  <span>Track your Riftbound collection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    ✓
                  </span>
                  <span>Track your Riftboundle progress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
