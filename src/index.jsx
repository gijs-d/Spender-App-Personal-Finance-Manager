import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom';

import { Providers } from './providers/providers';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <MemoryRouter>
    <Providers>
      <App />
    </Providers>
  </MemoryRouter>
);
