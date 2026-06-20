import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ignite the Liquid Glass Physics Engine
import './index.css';

// Mount the app with NO routing wrappers here to prevent the collision
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);