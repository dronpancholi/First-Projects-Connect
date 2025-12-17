
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error: any) {
    console.error("Critical Application Boot Failure:", error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #1a1a1a; color: #ef4444; font-family: -apple-system, system-ui, sans-serif; text-align: center; padding: 2rem;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Ecosystem Initialization Failed</h1>
        <p style="color: #9ca3af; max-width: 400px; line-height: 1.5; margin-bottom: 2rem;">
          A fatal error occurred during the system boot sequence. This is likely due to a module resolution failure or an incompatible browser version.
        </p>
        <pre style="background: #000; color: #10b981; padding: 1rem; border-radius: 8px; font-size: 12px; font-family: monospace; text-align: left; max-width: 100%; overflow-x: auto; margin-bottom: 2rem;">
${error?.message || 'Unknown resolution error'}
        </pre>
        <button onclick="window.location.reload()" style="background: #0071E3; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Attempt Force Reboot
        </button>
      </div>
    `;
  }
} else {
  console.error("Fatal Error: Root DOM element '#root' was not found.");
}
