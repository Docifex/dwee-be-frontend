import { useEffect, useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

// ✅ Create a context to share user info and roles
export const AuthContext = createContext(null);

/**
 * AuthWrapper initializes MSAL, handles redirects, and fetches the user's DB record (including roles).
 * Provides AuthContext to the app so AdminProtectedRoute and other components can check roles.
 */
export default function AuthWrapper({ children }) {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function initAuth() {
      // Optional debug output of current MSAL configuration
      try {
        const config = instance.getConfiguration();
        console.log('🔍 MSAL auth configuration:', config.auth);
      } catch (logErr) {
        console.error('Failed to read MSAL configuration:', logErr);
      }

    try {
    await instance.initialize();
    const result = await instance.handleRedirectPromise();

    if (result || (accounts && accounts.length > 0)) {
      const account = result?.account || accounts[0];

      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBase}/api/users/${account.idTokenClaims.oid}`);
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);

            /*
            // ✅ Assign admin role for current user as a patch to create the admin role
            // Remove this after setting roles permanently in the DB

            if (!userData.roles || !userData.roles.includes('admin')) {
            await fetch(`${apiBase}/api/users/${account.idTokenClaims.oid}/roles`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roles: ['admin'] })
            });
            console.log('✅ Admin role assigned to user');
            }

            // Remove or comment out to this point from above...
            */

             } else {
          console.warn('User record not found in DB');
          setUser(null);
          }
          } catch (err) {
          console.error('Failed to fetch user record:', err);
          setUser(null);
        }

         // ✅ Only redirect to dashboard if currently on root path
          if (window.location.pathname === '/' || window.location.pathname === '/landingpage') {
          navigate('/dashboard', { replace: true });
        }
      }
   } catch (e) {
      console.error('AuthWrapper initAuth error:', e);
      setAuthError(e);
    }
  }

    initAuth();
  }, [instance, accounts, navigate]);

  if (authError) {
    return (
      <div style={{ color: 'red', padding: '2rem' }}>
        <h2>Authentication Initialization Error</h2>
        <p>{authError.message}</p>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
