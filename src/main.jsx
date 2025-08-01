// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { BrowserRouter } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper.jsx';

import './index.css';
import App from './App';

/**
 * Environment variables (in .env):
 * VITE_CIAM_AUTHORITY_URL  - your CIAM authority URL
 * VITE_B2C_CLIENT_ID       - your application client ID
 * VITE_REDIRECT_URI        - where to redirect post-login
 */
const authority   = import.meta.env.VITE_CIAM_AUTHORITY_URL;
const clientId    = import.meta.env.VITE_B2C_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri,
    knownAuthorities: [new URL(authority).host],
  },
};

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Mount React application with MSAL Provider and Router
const container = document.getElementById('root');
if (!container) throw new Error('Could not find root element');

createRoot(container).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);


/* 
The code below causes the app to only render the dashboard component and not the landing page.

createRoot(container).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);

*/