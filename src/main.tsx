import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loader } from '@monaco-editor/react';

// ۱. تنظیم آدرس داخلی (حتماً قبل از رندر شدن اولین ادیتور انجام شود)
loader.config({
  paths: {
    vs: '/vs' // این آدرس به پوشه public/vs اشاره می‌کند
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
