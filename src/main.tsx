import React from 'react';
import ReactDOM from 'react-dom/client';
import TaiChiGame from './components/TaiChiGame';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TaiChiGame />
  </React.StrictMode>
);
