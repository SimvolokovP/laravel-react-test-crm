import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { Providers } from '@/shared/providers/providers';

const root = document.getElementById('app');

if (!root) {
  throw new Error('React root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
