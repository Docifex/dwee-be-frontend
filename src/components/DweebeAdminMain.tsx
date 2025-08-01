
/* App component that sets up the Admin routing for the dweebe enterprise.
 * It uses React Router to define different routes and their corresponding components.
 */
// dweebeAdminMain.tsx
// Updated Dashboard component with a button to navigate to dweebeAdminMain.
// This button will allow users to access account setup and profile management from the dashboard.

import React from 'react';
import { useNavigate } from 'react-router-dom';

function DweebeAdminMain(): React.JSX.Element {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/Dashboard', { state: { fromDweebeAdminMain: true } });

  };

  return (
    <div
      style={{
        backgroundColor: '#e24a84ff',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontSize: '2rem',
        margin: 0,
      }}
    >
      <div>dweebe Admin Main Loaded</div>
      {/* Add a button to navigate to Dashboard */}
      <button
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={goToDashboard}
      >
        Dashboard
      </button>
    </div>
  );
}

export default DweebeAdminMain;

