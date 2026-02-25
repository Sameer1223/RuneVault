import { useAuth0 } from "@auth0/auth0-react";

export default function AuthButton() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button onClick={() => loginWithRedirect()}>
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
    >
      Log Out
    </button>
  );
}
