import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ReactQueryProviders from './lib/react-query-provider.util'
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactQueryProviders>
      <Router>
        <App />
      </Router>
    </ReactQueryProviders>
  </React.StrictMode>,
)
