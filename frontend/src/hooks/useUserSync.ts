import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Custom hook to sync user with backend on Auth0 login
 * Uses Auth0 `sub` as the user identifier
 */
export const useUserSync = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || !user) {
        console.log('useUserSync: Not authenticated or user not loaded');
        return;
      }

      try {
        const token = await getAccessTokenSilently();

        const res = await fetch('http://localhost:5000/api/user/sync-user', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to sync user:', res.status, errorText);
          return;
        }

        const data = await res.json();
        console.log('User synced successfully:', data);

        // Store Auth0 ID (sub) as the user ID
        localStorage.setItem('userId', data.auth0_id);
        localStorage.setItem('username', data.username);

        if (data.is_new) {
          console.log('New user created:', data);
        }

      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);
};
