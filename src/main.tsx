import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import App from './App';
import './styles/index.css';
import { cmsService } from './services/cmsService';
import { applyTypographyToDocument } from './utils/typography';

if (typeof window !== 'undefined') {
  (window as any).__CMS__ = cmsService;
  applyTypographyToDocument(cmsService.getPublishedTypographySettings());
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
