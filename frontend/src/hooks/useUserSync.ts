import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Custom hook to sync user with backend on Auth0 login
 * Creates/updates user in database on first login
 */
export const useUserSync = () => {
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || !user) {
        console.log('useUserSync: Not authenticated or user not loaded');
        return;
      }

      try {
        // Get the access token from user's cache or request a new one
        const res = await fetch('http://localhost:5000/api/user/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send user email as identifier - backend can verify with public Auth0 endpoint
          body: JSON.stringify({
            email: user.email,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to sync user:', res.status, errorText);
          return;
        }

        const data = await res.json();
        console.log('User synced successfully:', data);
        
        // Store user ID in localStorage for later use
        localStorage.setItem('userId', data.user_id.toString());
        localStorage.setItem('userEmail', data.email);
        
        if (data.is_new) {
          console.log('New user created:', data);
        }

      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [isAuthenticated, user]);
};
