import { useAuth0 } from "@auth0/auth0-react";
import { LogIn, LogOut } from "lucide-react";

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className = "" }: AuthButtonProps) {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  if (isLoading) return null;

  const baseClass = `flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-200 hover:text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${className}`;

  if (!isAuthenticated) {
    return (
      <button onClick={() => loginWithRedirect()} className={baseClass}>
        <LogIn className="w-3.5 h-3.5" />
        Log In
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        })
      }
      className={baseClass}
    >
      <LogOut className="w-3.5 h-3.5" />
      Log Out
    </button>
  );
}
